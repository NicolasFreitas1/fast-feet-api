import { Entity } from 'src/core/entities/entity'
import { UniqueEntityId } from 'src/core/entities/unique-entity-id'
import { Optional } from 'src/core/types/optional'

export interface OrderProps {
  name: string
  status: 'waiting' | 'pickedUp' | 'delivered' | 'returned'
  deliverymanId: UniqueEntityId
  recipientId: UniqueEntityId
  createdAt: Date
  updatedAt?: Date | null
  pickedUpAt?: Date | null
  deliveredAt?: Date | null
}

export class Order extends Entity<OrderProps> {
  get name() {
    return this.props.name
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  get status() {
    return this.props.status
  }

  set status(status: 'waiting' | 'pickedUp' | 'delivered' | 'returned') {
    this.props.status = status

    switch (status) {
      case 'pickedUp':
        this.props.pickedUpAt = new Date()

      case 'delivered':
        this.props.deliveredAt = new Date()

      default:
        this.props.updatedAt = new Date()
    }
  }

  get deliverymanId() {
    return this.props.deliverymanId
  }

  set deliverymanId(deliverymanId: UniqueEntityId) {
    this.props.deliverymanId = deliverymanId
    this.touch()
  }

  get recipientId() {
    return this.props.recipientId
  }

  set recipientId(recipientId: UniqueEntityId) {
    this.props.recipientId = recipientId
    this.touch()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get pickedUpAt() {
    return this.props.pickedUpAt
  }

  get deliveredAt() {
    return this.props.deliveredAt
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<OrderProps, 'createdAt' | 'status'>,
    id?: UniqueEntityId,
  ) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? 'waiting',
      },
      id,
    )

    return order
  }
}
