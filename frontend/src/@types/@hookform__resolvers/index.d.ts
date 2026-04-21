declare module '@hookform/resolvers/yup' {
    import { Resolver } from '@hookform/resolvers';
    import { AnyObjectSchema } from 'yup';
  
    export function yupResolver(schema: AnyObjectSchema): Resolver;
}
  