import { Entity } from 'src/core/entities/entity'
import { UniqueEntityId } from 'src/core/entities/unique-entity-id'

export interface RecipientProps {
  name: string
  address: string
  phone: number
  cpf: string
}

export class Recipient extends Entity<RecipientProps> {
  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
  }

  get address() {
    return this.props.address
  }

  set address(address: string) {
    this.props.address = address
  }

  get phone() {
    return this.props.phone
  }

  set phone(phone: number) {
    this.props.phone = phone
  }

  get cpf() {
    return this.props.cpf
  }

  static create(props: RecipientProps, id?: UniqueEntityId) {
    const recipient = new Recipient(props, id)

    return recipient
  }
}
