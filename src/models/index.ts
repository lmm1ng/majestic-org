export interface IOrg {
  channelId: string
  departments: IDepartment[]
}

export interface IDepartment {
  channelId: string
  roles: string[]
}

export interface IRole {
  id: string
  name: string
}

export interface IMember {
  id: string
  displayName: string
  roles: IRole[]
}
