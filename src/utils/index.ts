interface ResponseSuccess<T> {
    success: true;
    result: T;
}

interface ResponseError {
    success: false;
    error: string;
}

type ResponseData<T> = ResponseSuccess<T> | ResponseError;

export {
    ResponseData
};