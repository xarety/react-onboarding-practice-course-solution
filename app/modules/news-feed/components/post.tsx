import * as React from 'react';

import { observer } from 'mobx-react-lite';

import { Card, Stack, Dropdown, Link, Icon, Dialog, Avatar } from '@servicetitan/design-system';

import { Post as PostModel } from '../api/news-feed.api';

import { Confirm, ConfirmationProps } from '../../common/components/confirm/confirm';

import * as moment from 'moment';

interface PostProps {
    post: PostModel;
    onEdit(post: PostModel): void;
    onDelete(post: PostModel): void;
}

export const Post: React.FC<PostProps> = observer(
    ({ post, onEdit, onDelete }) => {
        const { title, description, author, created } = post;

        const handleEdit = () => onEdit(post);
        const handleDelete = () => onDelete(post);

        return (
            <Card>
                <Card.Section>
                    <p className="h3 m-0 m-b-1">
                        {title}
                    </p>

                    <p className="fs-2 m-0">
                        {description}
                    </p>
                </Card.Section>

                <Card.Section light className="c-neutral-90 fs-2">
                    <Stack alignItems="center" justifyContent="space-between">
                        <Stack alignItems="center">
                            <Avatar name={author.name} autoColor className="m-r-1" />
                            <Stack.Item fill>
                                <div className="fw-bold">
                                    {author.name}
                                </div>
                                <div>
                                    {moment(created).fromNow()}
                                </div>
                            </Stack.Item>
                        </Stack>

                        <Dropdown
                            trigger={
                                <Link>
                                    <Icon size={24} name="more_horiz" />
                                </Link>
                            }
                            icon={null}
                        >
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>

                                <Confirm
                                    confirmation={DeleteConfirmation}
                                    onClick={handleDelete}
                                >
                                    {onClick => (
                                        <Dropdown.Item onClick={onClick}>
                                            Delete
                                        </Dropdown.Item>
                                    )}
                                </Confirm>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Stack>
                </Card.Section>
            </Card>
        );
    }
);

const DeleteConfirmation: React.FC<ConfirmationProps> = ({ onCancel, onConfirm }) => (
    <Dialog
        open
        closable
        onClose={onCancel}
        title="Delete Post"
        onPrimaryActionClick={onConfirm}
        primaryActionName="Delete"
        onSecondaryActionClick={onCancel}
        secondaryActionName="Cancel"
        negative
    >
        Are you sure you want to delete this post?
    </Dialog>
);
