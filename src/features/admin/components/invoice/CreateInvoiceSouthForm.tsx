import { CreateInvoiceVariantForm, type InvoiceVariantFormProps } from './CreateInvoiceVariantForm'

export function CreateInvoiceSouthForm(props: Omit<InvoiceVariantFormProps, 'variant'>) {
  return <CreateInvoiceVariantForm {...props} variant="SOUTH" />
}
