import * as React from 'react';

import { provide, useDependencies } from '@servicetitan/react-ioc';

import { observer } from 'mobx-react';

import { Modal, Form, Button } from '@servicetitan/design-system';

import { Post, EditablePost } from '../api/news-feed.api';

import { EditFormStore } from '../stores/edit-form.store';

interface EditFormProps {
    post?: Post;
    onSave(changes: EditablePost): void;
    onCancel(): void;
}

export const EditForm: React.FC<EditFormProps> = provide({ singletons: [EditFormStore] })(
    observer(({ post, onSave, onCancel }) => {
        const [editFormStore] = useDependencies(EditFormStore);

        const { form, isDirty } = editFormStore;
        const {
            $: { title, description }
        } = form;

        React.useEffect(() => {
            editFormStore.initialize(post);
        }, [editFormStore, post]);

        const handleSaveClick = async () => {
            const changes = await editFormStore.export();

            if (changes) {
                onSave(changes);
            }
        };

        return (
            <Modal
                open
                title={post ? 'Edit Post' : 'Create Post'}
                size={Modal.Sizes.S}
                footer={
                    <React.Fragment>
                        <Button onClick={onCancel}>Cancel</Button>

                        <Button
                            primary
                            disabled={!isDirty || form.hasError}
                            onClick={handleSaveClick}
                        >
                            Save
                        </Button>
                    </React.Fragment>
                }
                footerAlign="space-between"
            >
                <Form>
                    <Form.Input
                        label="Title"
                        value={title.value}
                        onChange={title.onChangeHandler}
                        error={title.hasError}
                    />

                    <Form.TextArea
                        label="Description"
                        value={description.value}
                        onChange={description.onChangeHandler}
                        error={description.hasError}
                        rows={5}
                    />
                </Form>
            </Modal>
        );
    })
);
