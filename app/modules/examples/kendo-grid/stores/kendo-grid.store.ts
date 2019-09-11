import { injectable } from '@servicetitan/react-ioc';

import { computed } from 'mobx';

import { InMemoryDataSource } from '../../../common/components/kendo-grid/data-sources';
import { KendoGridState } from '../../../common/components/kendo-grid/kendo-grid-state';

import { setFormStateValues } from '../../../common/utils/form-helpers';
import { FormState, FieldState } from 'formstate';

import { FormValidators } from '../../../common/utils/form-validators';
import { Product, UserRole, Supplier } from '../utils/product';
import { products } from '../utils/products';

@injectable()
export class KendoGridStore {
    gridState = new KendoGridState({
        dataSource: this.getDataSource(),
        isRowUnselectable: this.isRowUnselectable,
        selectionLimit: 3,
        getFormState: this.getFormState,
        pageSize: 5
    });

    @computed get inEdit() {
        return this.gridState.inEdit.size > 0;
    }

    private getDataSource() {
        return new InMemoryDataSource(products, this.idSelector, {
            Supplier: (value: Supplier) => Supplier[value],
            AvailableFor: (value: UserRole | undefined) => value && UserRole[value]
        });
    }

    private idSelector(row: Product) {
        return row.ProductID;
    }

    private isRowUnselectable(row: Product) {
        return row.Discontinued;
    }

    private getFormState(row: Product) {
        return setFormStateValues(
            new FormState({
                ProductID: new FieldState(0),
                ProductName: new FieldState('').validators(FormValidators.required),
                Supplier: new FieldState<Supplier>(Supplier.Adam),
                CategoryID: new FieldState(0),
                QuantityPerUnit: new FieldState(''),
                UnitPrice: new FieldState(0).validators(
                    value => value <= 0 && 'Price must be positive'
                ),
                UnitsInStock: new FieldState(0),
                UnitsOnOrder: new FieldState(new Date()).validators(
                    value => value > new Date() && 'Invalid date'
                ),
                Discontinued: new FieldState(false),
                AvailableFor: new FieldState<UserRole | undefined>(undefined)
            }),
            row
        );
    }

    editAll = () => this.gridState.editAll();
    saveAll = () => this.gridState.saveEditAll();
    cancelAll = () => this.gridState.cancelEditAll();
}
