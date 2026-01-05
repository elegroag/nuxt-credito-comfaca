export interface XmlExtractRequest {
    filename: string;
    validate: boolean;
}

export interface XmlExtractResponse {
    success: boolean;
    data: any;
    error?: string;
}
