import * as React from 'react';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { observer } from 'mobx-react';

import { Page, Layout, Button } from '@servicetitan/design-system';

import { NewsFeedApi, Post as PostModel, EditablePost } from '../api/news-feed.api';

import { NewsFeedStore } from '../stores/news-feed.store';

import { Post } from './post';
import { EditForm } from './edit-form';

export const NewsFeed: React.FC = provide({ singletons: [NewsFeedApi, NewsFeedStore] })(
    observer(() => {
        const [newsFeedStore] = useDependencies(NewsFeedStore);

        const handleCreate = () => newsFeedStore.create();
        const handleEdit = (post: PostModel) => newsFeedStore.edit(post);
        const handleDelete = (post: PostModel) => newsFeedStore.delete(post.id);

        const handleSaveEdit = (changes: EditablePost) => newsFeedStore.save(changes);
        const handleCancelEdit = () => newsFeedStore.cancel();

        return (
            <Page
                header={
                    <div className="ta-center">
                        <Button primary onClick={handleCreate}>
                            Create New
                        </Button>
                    </div>
                }
            >
                <Layout type="island">
                    {newsFeedStore.posts.map(post => (
                        <Layout.Section key={post.id}>
                            <Post post={post} onEdit={handleEdit} onDelete={handleDelete} />
                        </Layout.Section>
                    ))}
                </Layout>

                {newsFeedStore.inEdit && (
                    <EditForm
                        post={newsFeedStore.inEdit.post}
                        onCancel={handleCancelEdit}
                        onSave={handleSaveEdit}
                    />
                )}
            </Page>
        );
    })
);
