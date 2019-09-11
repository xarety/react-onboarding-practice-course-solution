import { Product, UserRole, Supplier } from './product';

export const products: Product[] = [
    {
        ProductID: 1,
        ProductName: 'Chai',
        Supplier: Supplier.Dan,
        CategoryID: 1,
        QuantityPerUnit: '10 boxes x 20 bags',
        UnitPrice: 18.0,
        UnitsInStock: 39,
        UnitsOnOrder: new Date('1/11/2019'),
        Discontinued: false,
        AvailableFor: UserRole.Admin
    },
    {
        ProductID: 2,
        ProductName: 'Chang',
        Supplier: Supplier.Dan,
        CategoryID: 1,
        QuantityPerUnit: '24 - 12 oz bottles',
        UnitPrice: 19.0,
        UnitsInStock: 17,
        UnitsOnOrder: new Date('2/11/2019'),
        Discontinued: false
    },
    {
        ProductID: 3,
        ProductName: 'Aniseed Syrup',
        Supplier: Supplier.Dan,
        CategoryID: 2,
        QuantityPerUnit: '12 - 550 ml bottles',
        UnitPrice: 10.0,
        UnitsInStock: 13,
        UnitsOnOrder: new Date('3/11/2019'),
        Discontinued: false,
        AvailableFor: UserRole.Owner
    },
    {
        ProductID: 4,
        ProductName: "Chef Anton's Cajun Seasoning",
        Supplier: Supplier.Adam,
        CategoryID: 2,
        QuantityPerUnit: '48 - 6 oz jars',
        UnitPrice: 22.0,
        UnitsInStock: 53,
        UnitsOnOrder: new Date('4/11/2019'),
        Discontinued: false
    },
    {
        ProductID: 5,
        ProductName: "Chef Anton's Gumbo Mix",
        Supplier: Supplier.Adam,
        CategoryID: 2,
        QuantityPerUnit: '36 boxes',
        UnitPrice: 21.35,
        UnitsInStock: 0,
        UnitsOnOrder: new Date('5/11/2019'),
        Discontinued: true,
        AvailableFor: UserRole.GeneralOffice
    },
    {
        ProductID: 6,
        ProductName: "Grandma's Boysenberry Spread",
        Supplier: Supplier.Charlie,
        CategoryID: 2,
        QuantityPerUnit: '12 - 8 oz jars',
        UnitPrice: 25.0,
        UnitsInStock: 120,
        UnitsOnOrder: new Date('6/11/2019'),
        Discontinued: false
    },
    {
        ProductID: 7,
        ProductName: "Uncle Bob's Organic Dried Pears",
        Supplier: Supplier.Charlie,
        CategoryID: 7,
        QuantityPerUnit: '12 - 1 lb pkgs.',
        UnitPrice: 30.0,
        UnitsInStock: 15,
        UnitsOnOrder: new Date('7/11/2019'),
        Discontinued: false
    },
    {
        ProductID: 8,
        ProductName: 'Northwoods Cranberry Sauce',
        Supplier: Supplier.Charlie,
        CategoryID: 2,
        QuantityPerUnit: '12 - 12 oz jars',
        UnitPrice: 40.0,
        UnitsInStock: 6,
        UnitsOnOrder: new Date('8/11/2019'),
        Discontinued: false
    },
    {
        ProductID: 9,
        ProductName: 'Mishi Kobe Niku',
        Supplier: Supplier.Benjamin,
        CategoryID: 6,
        QuantityPerUnit: '18 - 500 g pkgs.',
        UnitPrice: 97.0,
        UnitsInStock: 29,
        UnitsOnOrder: new Date('9/11/2019'),
        Discontinued: true
    },
    {
        ProductID: 10,
        ProductName: 'Ikura',
        Supplier: Supplier.Benjamin,
        CategoryID: 8,
        QuantityPerUnit: '12 - 200 ml jars',
        UnitPrice: 31.0,
        UnitsInStock: 31,
        UnitsOnOrder: new Date('10/11/2019'),
        Discontinued: false
    }
];
