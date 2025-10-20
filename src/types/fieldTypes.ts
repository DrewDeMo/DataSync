export type FieldType =
    | 'text'
    | 'textarea'
    | 'markdown'
    | 'date'
    | 'number'
    | 'select'
    | 'multi-select'
    | 'phone'
    | 'email'
    | 'url'
    | 'image';

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    options?: string[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

export interface ContentTypeSchema {
    fields: FieldDefinition[];
}
