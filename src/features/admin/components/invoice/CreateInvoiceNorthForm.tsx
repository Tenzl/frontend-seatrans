import { CreateInvoiceVariantForm, type InvoiceVariantFormProps } from './CreateInvoiceVariantForm'

export function CreateInvoiceNorthForm(props: Omit<InvoiceVariantFormProps, 'variant'>) {
  return <CreateInvoiceVariantForm {...props} variant="NORTH" />
}
