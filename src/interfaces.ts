export interface IFilter {
  logic: 'and'
  filters: [
    {
      field: 'Label'
      operator: 'endswith'
      value: string
    }
  ]
}

export interface IContext {
  hostname?: string | null
  loginTime?: string | null
  cookies?: any
  apiVerificationToken?: string | null
  licenseNumber?: string | null
}
