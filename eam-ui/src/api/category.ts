import request from './request';

export interface Category {
    id: number;
    parentId: number;
    categoryName: string;
    categoryPrefix: string;
    orderNum: number;
    status: string;
    children?: Category[];
}

export const listCategory = () => {
    return request.get<any, { data: Category[] }>('/asset/category/list');
};

export const treeCategory = () => {
    return request.get<any, { data: Category[] }>('/asset/category/tree');
};

export const addCategory = (data: Partial<Category>) => {
    return request.post('/asset/category', data);
};

export const updateCategory = (data: Partial<Category>) => {
    return request.put('/asset/category', data);
};

export const deleteCategory = (id: number) => {
    return request.delete(`/asset/category/${id}`);
};
