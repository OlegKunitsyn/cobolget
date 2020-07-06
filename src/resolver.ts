// Cloned from https://github.com/pghalliday/semver-resolver
import * as semver from 'semver';
import * as lodash from 'lodash';
import * as uuid from 'uuid';

export class Resolver {
	private static graph: Object;
	private root: string;
	private state;
	private queuedCalculations;
	private queuedConstraintUpdates;
	private cachedVersions;
	private cachedDependencies;

	constructor(graph: Object, dependencies) {
		Resolver.graph = graph;
		const rootName:string = uuid.v4();
		this.root = rootName;
		let state = this.state = {};
		let rootState = state[rootName] = {
			dependencies
		};
		rootState.dependencies = lodash.mapValues(dependencies, range => {
			return {
				range: range
			};
		});
		this.queuedCalculations = Object.keys(dependencies);
		this.queuedConstraintUpdates = [];
		this.cachedVersions = {};
		this.cachedDependencies = {};
	}

	public async resolve() {
		await this.start();
		let resolution = lodash.mapValues(this.state, value => value.version);
		delete resolution[this.root];
		return resolution;
	}

	private cleanQueuedCalculations() {
		let state = this.state;
		let knownLibraries = Object.keys(state);
		knownLibraries.forEach(library => {
			let dependencies = state[library].dependencies;
			// dependencies will always be populated
			// here because we just finished updating
			// from the queued constraints - if it isn't
			// then something probably changed around
			// the refillQueues/updateConstraints functions
			knownLibraries = lodash.union(
				knownLibraries,
				Object.keys(dependencies)
			);
		});
		this.queuedCalculations = lodash.intersection(
			this.queuedCalculations,
			knownLibraries
		);
	}

	private cleanQueuedConstraintUpdates() {
		let state = this.state;
		let knownLibraries = Object.keys(state);
		// we only want to look up dependencies for
		// libraries still in the state
		this.queuedConstraintUpdates = lodash.intersection(
			this.queuedConstraintUpdates,
			knownLibraries
		);
	}

	private dropLibrary(library) {
		let queuedCalculations = this.queuedCalculations;
		let state = this.state;
		let libraryState = state[library];
		if (libraryState) {
			// remove from state
			delete state[library];
			let dependencies = libraryState.dependencies;
			if (dependencies) {
				lodash.forEach(Object.keys(dependencies), dependency => {
					// drop old data for dependency if we have it
					// already as it should not
					// be used in calculations anymore
					this.dropLibrary(dependency);
					// queue dependency for recalculation
					// as a constraint has been dropped
					// but it may still be a dependency
					// of another library still in the tree
					queuedCalculations.push(dependency);
				});
			}
		}
	}

	private updateConstraints(library) {
		let state = this.state;
		let cachedDependencies = this.cachedDependencies;
		let libraryState = state[library];
		// check if this library is still in the state.
		// it may already have been dropped in an earlier
		// update, in which case the information we would
		// apply now is invalid anyway
		if (libraryState) {
			let version = libraryState.version;
			let dependencies = cachedDependencies[library][version];
			let queuedCalculations = this.queuedCalculations;
			libraryState.dependencies = dependencies;
			// We don't need to worry about the possibility that there were already
			// dependencies attached to the library. It should
			// never happen as the only way to get into the update
			// queue is from the calculation queue and the only way
			// into the caclulation queue is on initialisation or
			// immediately after being dropped from the state. Thus
			// all these dependency constraints are new and none
			// will be dropped.
			Object.keys(dependencies).forEach(dependency => {
				// drop old data for dependency if we have it
				// already as it should not
				// be used in calculations anymore
				this.dropLibrary(dependency);
				// queue dependency for recalculation
				// as a constraint has been dropped
				// but it may still be a dependency
				// of another library still in the tree
				queuedCalculations.push(dependency);
			});
		}
	}

	private maxSatisfying(library) {
		let state = this.state;
		let versions = this.cachedVersions[library];
		let queuedCalculations = this.queuedCalculations;
		let dependencyLibraries = [];
		// first collect all the constraints and the max versions
		// satisfying them, keyed by the parent that adds the constraint
		lodash.forOwn(state, (libraryState, parent) => {
			let dependencies = libraryState.dependencies;
			if (dependencies) {
				let dependencyLibrary = dependencies[library];
				if (dependencyLibrary) {
					if (!dependencyLibrary.maxSatisfying) {
						let range = dependencyLibrary.range;
						let maxSatisfying = semver.maxSatisfying(versions, range);
						if (maxSatisfying === null) {
							let backtrackedDueTo = dependencyLibrary.backtrackedDueTo;
							let constrainingLibrary = 'root';
							let version = libraryState.version;
							if (version) {
								constrainingLibrary = `${parent}@${version}`;
							}
							if (backtrackedDueTo) {
								throw new Error(
									`Unable to satisfy backtracked version constraint: ` +
									`${library}@${range} from ` +
									`${constrainingLibrary} due to shared ` +
									`constraint on ${backtrackedDueTo}`
								);
							} else {
								throw new Error(
									`Unable to satisfy version constraint: ` +
									`${library}@${range} from ` +
									`${constrainingLibrary}`
								);
							}
						}
						dependencyLibrary.maxSatisfying = maxSatisfying;
					}
					dependencyLibraries[parent] = dependencyLibrary;
				}
			}
		});
		// next scan the max versions to find the minimum
		let lowestMaxSatisfying = null;
		lodash.forOwn(dependencyLibraries, (dependencyLibrary, parent) => {
			let maxSatisfying = dependencyLibrary.maxSatisfying;
			if (lowestMaxSatisfying === null) {
				lowestMaxSatisfying = {
					parent: parent,
					version: maxSatisfying
				};
			}
			if (maxSatisfying < lowestMaxSatisfying.version) {
				lowestMaxSatisfying.parent = parent;
				lowestMaxSatisfying.version = maxSatisfying;
			}
		});
		// then check if that minimum satisfies the other constraints
		// if a conflicting constraint is found then we have no version and should
		// drop and requeue the library version that adds the conflict, with
		// a new constraint to check for an earlier version of it
		let constrainingParent = lowestMaxSatisfying.parent;
		let version = lowestMaxSatisfying.version;
		let resolutionFound = true;
		lodash.forOwn(dependencyLibraries, (dependencyLibrary, parent) => {
			if (parent !== constrainingParent) {
				let range = dependencyLibrary.range;
				if (!semver.satisfies(version, range)) {
					// check if parent is root as root
					// cannot be backtracked
					let constrainingState = state[constrainingParent];
					let constrainedState = state[parent];
					let constrainedStateVersion = constrainedState.version;
					if (!constrainedStateVersion) {
						throw new Error(
							`Unable to satisfy version constraint: ` +
							`${library}@${range} from root due to ` +
							'shared constraint from ' +
							`${constrainingParent}@${constrainingState.version}`
						);
					}

					// constraint cannot be met so add a new constraint
					// to the parent providing the lowest version for this
					// conflicting parent to backtrack to the next lowest version
					constrainingState.dependencies[parent] = {
						range: `<${constrainedStateVersion}`,
						backtrackedDueTo: library
					};
					// drop old data for dependency if we have it
					// already as it should not
					// be used in calculations anymore
					this.dropLibrary(parent);
					// queue dependency for recalculation
					// as a constraint has been dropped
					// but it may still be a dependency
					// of another library still in the tree
					queuedCalculations.push(parent);
					resolutionFound = false;
					return resolutionFound;
				}
			}
		});
		if (resolutionFound) {
			return version;
		}
		return null;
	}

	private async cacheVersions() {
		let cachedVersions = this.cachedVersions;
		let librariesAlreadyCached = Object.keys(cachedVersions);
		let queuedCalculations = this.queuedCalculations;
		let librariesToCache = lodash.difference(
			queuedCalculations, librariesAlreadyCached
		);
		const versionsArray: Array<any> = await Promise.all(librariesToCache.map(this.getVersions));
		versionsArray.forEach((versions, index: number) => {
			cachedVersions[librariesToCache[index]] = versions.slice(0).sort(semver.rcompare);
		});
	}

	private resolveVersions() {
		let queuedCalculations = this.queuedCalculations;
		let nextQueuedCalculations = this.queuedCalculations = [];
		let state = this.state;
		let queuedConstraintUpdates = this.queuedConstraintUpdates;
		queuedCalculations.forEach(library => {
			// don't calculate now if the library was already requeued
			// due to backtracking - it may have been orphaned
			// and anyway tracking the state gets complicated
			if (!lodash.includes(nextQueuedCalculations, library)) {
				let version = this.maxSatisfying(library);
				if (version) {
					state[library] = {
						version: version
					};
					queuedConstraintUpdates.push(library);
				}
			}
		});
		// clean up the queued constraint updates
		// as some of the libraries may no longer
		// even be in dependencies
		this.cleanQueuedConstraintUpdates();
	}

	private async cacheDependencies() {
		let state = this.state;
		let cachedDependencies = this.cachedDependencies;
		let queuedConstraintUpdates = this.queuedConstraintUpdates;
		let dependenciesToCache = queuedConstraintUpdates.filter(library => {
			let version = state[library].version;
			let versions = cachedDependencies[library];
			if (versions) {
				if (versions[version]) {
					return false;
				}
			}
			return true;
		});
		const dependenciesArray = await Promise.all(dependenciesToCache.map(
			library_1 => {
				return this.getDependencies(library_1, state[library_1].version
				);
			}
		));
		dependenciesArray.forEach((dependencies: [], index) => {
			let library_2 = dependenciesToCache[index];
			cachedDependencies[library_2] = cachedDependencies[library_2] || {};
			cachedDependencies[library_2][state[library_2].version] =
				lodash.mapValues(dependencies, range => {
					return {
						range: range
					};
				});
		});
	}

	private refillQueues() {
		let queuedConstraintUpdates = lodash.uniq(this.queuedConstraintUpdates);
		this.queuedConstraintUpdates = [];
		queuedConstraintUpdates.forEach(library => {
			this.updateConstraints(library);
		});
		// clean up the queued calculations
		// as some of the libraries may no longer
		// even be in dependencies
		this.cleanQueuedCalculations();
	}

	private recurse() {
		if (this.queuedCalculations.length) {
			return this.start();
		}
	}

	private start() {
		return this.cacheVersions()
			.then(this.resolveVersions.bind(this))
			.then(this.cacheDependencies.bind(this))
			.then(this.refillQueues.bind(this))
			.then(this.recurse.bind(this));
	}

	private async getVersions(name: string): Promise<any> {
		return Promise.resolve().then(() => {
			let versions = Resolver.graph[name];
			if (!versions) {
				throw new Error(`Package '${name}' not found`);
			}
			return Object.keys(versions);
		});
	}

	private async getDependencies(name: string, version: string): Promise<any> {
		return Promise.resolve().then(() => {
			return Resolver.graph[name][version];
		});
	}
}
