import { injectable, inject } from '@servicetitan/react-ioc';

import { observable, action, runInAction } from 'mobx';

import { Post, NewsFeedApi, EditablePost } from '../api/news-feed.api';

@injectable()
export class NewsFeedStore {
    @observable posts: Post[] = [];

    @observable inEdit?: {
        post?: Post;
    };

    constructor(@inject(NewsFeedApi) private readonly newsFeedApi: NewsFeedApi) {
        this.initialize();
    }

    private async initialize() {
        try {
            const posts = (await this.newsFeedApi.getAll()).data;

            runInAction(() => {
                this.posts = posts;
            });
        } catch {
            runInAction(() => {
                this.posts = [];
            });
        }
    }

    @action
    create() {
        this.inEdit = {};
    }

    @action
    edit(post: Post) {
        this.inEdit = { post };
    }

    async save(changes: EditablePost) {
        if (!this.inEdit) {
            return;
        }

        const { post } = this.inEdit;

        if (post) {
            const { id } = post;

            await this.newsFeedApi.update(id, changes);

            const index = this.posts.findIndex(post => post.id === id);
            if (index !== -1) {
                runInAction(() => {
                    Object.assign(this.posts[index], changes);
                });
            }
        } else {
            const newPost = (await this.newsFeedApi.create(changes)).data;

            if (newPost) {
                runInAction(() => {
                    this.posts.unshift(newPost);
                });
            }
        }

        this.cancel();
    }

    @action
    cancel() {
        this.inEdit = undefined;
    }

    async delete(id: number) {
        await this.newsFeedApi.delete(id);

        runInAction(() => {
            this.posts = this.posts.filter(post => post.id !== id);
        });
    }
}
