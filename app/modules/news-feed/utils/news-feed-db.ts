import { User } from '../../common/api/auth.api';
import { Post, EditablePost } from '../api/news-feed.api';

import { Sam, Mike } from '../../common/utils/user-management-db';

import { cloneDeep } from '../../common/utils/clone-deep';
import { getRandomId } from '../../common/utils/get-random-id';

class NewsFeedDB {
    private readonly posts: Post[];

    constructor() {
        this.posts = [
            {
                id: 1,
                title: 'Lorem ipsum',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                created: new Date(2019, 5, 7, 12, 35),
                author: {
                    id: Sam.id,
                    name: Sam.login
                }
            },
            {
                id: 2,
                title: 'Lorem ipsum',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                created: new Date(2019, 5, 5, 19, 20),
                author: {
                    id: Mike.id,
                    name: Mike.login
                }
            },
            {
                id: 3,
                title: 'Lorem ipsum',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                created: new Date(2019, 5, 5, 15, 1),
                author: {
                    id: Mike.id,
                    name: Mike.login
                }
            }
        ];
    }

    getAll() {
        return cloneDeep(this.posts);
    }

    private getById(id: number) {
        return this.posts.find(
            post => post.id === id
        );
    }

    create(data: EditablePost, author: User) {
        const post = {
            ...data,
            author: {
                id: author.id,
                name: author.login
            },
            created: new Date(),
            id: getRandomId()
        };

        this.posts.unshift(post);

        return cloneDeep(post);
    }

    update(id: number, changes: EditablePost) {
        const post = this.getById(id);

        if (post) {
            return cloneDeep(
                Object.assign(post, changes)
            );
        }
    }

    delete(id: number) {
        const post = this.getById(id);

        if (post) {
            this.posts.splice(this.posts.indexOf(post), 1);
            return cloneDeep(post);
        }
    }
}

const instance = new NewsFeedDB();

export { instance as NewsFeedDB };
