/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { set } from '@elastic/safer-lodash-set';
import { get, has } from 'lodash';
import { SavedObject as SavedObjectType } from '../../server';
import { SavedObjectsClientContract } from './saved_objects_client';

/**
 * This class is a very simple wrapper for SavedObjects loaded from the server
 * with the {@link SavedObjectsClient}.
 *
 * It provides basic functionality for creating/saving/deleting saved objects,
 * but doesn't include any type-specific implementations.
 *
 * @public
 */
export class SimpleSavedObject<T = unknown> {
  public attributes: T;
  // We want to use the same interface this class had in JS
  public _version?: SavedObjectType<T>['version'];
  public id: SavedObjectType<T>['id'];
  public type: SavedObjectType<T>['type'];
  public migrationVersion: SavedObjectType<T>['migrationVersion'];
  public error: SavedObjectType<T>['error'];
  public references: SavedObjectType<T>['references'];

  constructor(
    private client: SavedObjectsClientContract,
    { id, type, version, attributes, error, references, migrationVersion }: SavedObjectType<T>
  ) {
    this.id = id;
    this.type = type;
    this.attributes = attributes || ({} as T);
    this.references = references || [];
    this._version = version;
    this.migrationVersion = migrationVersion;
    if (error) {
      this.error = error;
    }
  }

  public get(key: string): any {
    return get(this.attributes, key);
  }

  public set(key: string, value: any): T {
    return set(this.attributes as any, key, value);
  }

  public has(key: string): boolean {
    return has(this.attributes, key);
  }

  public save(): Promise<SimpleSavedObject<T>> {
    if (this.id) {
      return this.client.update(this.type, this.id, this.attributes, {
        migrationVersion: this.migrationVersion,
        references: this.references,
      });
    } else {
      return this.client.create(this.type, this.attributes, {
        migrationVersion: this.migrationVersion,
        references: this.references,
      });
    }
  }

  public delete() {
    return this.client.delete(this.type, this.id);
  }
}
