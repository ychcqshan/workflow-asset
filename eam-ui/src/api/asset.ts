import request from './request';

export interface Asset {
    id: number;
    assetCode: string;
    assetName: string;
    categoryId: number;
    deptId: number;
    userId: number;
    status: string;
    location: string;
    purchaseDate: string;
    price: number;
    spec: string;
    snCode: string;
    remark: string;
}

export const listAsset = (params: any) => {
    return request.get<any, { data: { records: Asset[], total: number } }>('/asset/ledger/list', { params });
};

export const getAsset = (id: number) => {
    return request.get<any, { data: Asset }>(`/asset/ledger/${id}`);
};

export const addAsset = (data: Partial<Asset>) => {
    return request.post('/asset/ledger', data);
};

export const updateAsset = (data: Partial<Asset>) => {
    return request.put('/asset/ledger', data);
};

export const deleteAsset = (ids: string) => {
    return request.delete(`/asset/ledger/${ids}`);
};
