import { injectable } from '@servicetitan/react-ioc';

import { observable, computed, action } from 'mobx';

import { FormState } from 'formstate';
import { InputFieldState, TextAreaFieldState, setFormStateValues, formStateToJS } from '../../common/utils/form-helpers';

import { Post } from '../api/news-feed.api';

import { FormValidators } from '../../common/utils/form-validators';

@injectable()
export class EditFormStore {
    @observable post?: Post;

    form = new FormState({
        title: new InputFieldState('').validators(FormValidators.required),
        description: new TextAreaFieldState('').validators(FormValidators.required)
    });

    @computed
    get isDirty() {
        const { $: { title, description } } = this.form;
        return this.post
            ? title.dirty || description.dirty
            : title.dirty && description.dirty;
    }

    @action
    initialize(post?: Post) {
        if (post) {
            this.post = post;

            setFormStateValues(
                this.form,
                post
            );
        }
    }

    async export() {
        const res = await this.form.validate();
        if (res.hasError) {
            return false;
        }

        return formStateToJS(this.form);
    }
}
