import { injectable, inject } from '@servicetitan/react-ioc';

import { AxiosPromise } from 'axios';

import { AuthStore } from '../../common/stores/auth.store';

import { SelectableEntity } from '../../common/interfaces/selectable-entity';

import { NewsFeedDB } from '../utils/news-feed-db';

export interface INewsFeedApi {
    getAll(): AxiosPromise<Post[]>;
    create(post: Post): AxiosPromise<EditablePost>;
    update(id: number, post: EditablePost): AxiosPromise<void>;
    delete(id: number): AxiosPromise<void>;
}

@injectable()
export class NewsFeedApi implements INewsFeedApi {
    constructor(@inject(AuthStore) private readonly authStore: AuthStore) { }

    getAll(): AxiosPromise<Post[]> {
        return this.resolve(
            NewsFeedDB.getAll()
        );
    }

    create(data: EditablePost): AxiosPromise<Post> {
        const { user } = this.authStore;

        if (!user) {
            return this.reject();
        }

        const post = NewsFeedDB.create(data, user);

        return this.resolve(
            post
        );
    }

    update(id: number, changes: EditablePost): AxiosPromise<void> {
        const post = NewsFeedDB.update(id, changes);

        if (post) {
            return this.resolve();
        }

        return this.reject();
    }

    delete(id: number): AxiosPromise<void> {
        const post = NewsFeedDB.delete(id);

        if (post) {
            return this.resolve();
        }

        return this.reject();
    }

    private resolve<T = void>(data?: T) {
        return Promise.resolve({
            data
        }) as AxiosPromise<T>;
    }

    private reject() {
        return Promise.reject({
            code: '500'
        });
    }
}

export interface Post {
    id: number;
    title: string;
    description: string;
    author: SelectableEntity;
    created: Date;
}

export interface EditablePost {
    title: string;
    description: string;
}
