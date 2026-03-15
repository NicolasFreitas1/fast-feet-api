import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { OrderCreatedEvent } from './events/order-created-event'
import { OrderDeliveredEvent } from './events/order-delivered-event'
import { OrderMarkedAsWaitingEvent } from './events/order-marked-as-waiting-event'
import { OrderPickedUpEvent } from './events/order-picked-up-event'
import { OrderReturnedEvent } from './events/order-returned-event'

export interface OrderProps {
  name: string
  status: 'waiting' | 'pickedUp' | 'delivered' | 'returned'
  deliverymanId?: UniqueEntityId | null
  recipientId: UniqueEntityId
  deliveryPhotoUrl?: string | null
  createdAt: Date
  updatedAt?: Date | null
  pickedUpAt?: Date | null
  deliveredAt?: Date | null
}

export class Order extends AggregateRoot<OrderProps> {
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
        break
      case 'delivered':
        this.props.deliveredAt = new Date()
        break
      default:
        break
    }
    this.props.updatedAt = new Date()
  }

  get deliverymanId() {
    return this.props.deliverymanId ?? null
  }

  set deliverymanId(deliverymanId: UniqueEntityId | null | undefined) {
    this.props.deliverymanId = deliverymanId ?? undefined
    this.touch()
  }

  get deliveryPhotoUrl() {
    return this.props.deliveryPhotoUrl ?? null
  }

  set deliveryPhotoUrl(value: string | null | undefined) {
    this.props.deliveryPhotoUrl = value ?? undefined
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

  pickUp(deliverymanId: UniqueEntityId): void {
    this.deliverymanId = deliverymanId
    this.status = 'pickedUp'
    this.addDomainEvent(new OrderPickedUpEvent(this))
  }

  deliver(deliveryPhotoUrl: string): void {
    this.deliveryPhotoUrl = deliveryPhotoUrl
    this.status = 'delivered'
    this.addDomainEvent(new OrderDeliveredEvent(this))
  }

  returnOrder(): void {
    this.status = 'returned'
    this.addDomainEvent(new OrderReturnedEvent(this))
  }

  markAsWaiting(): void {
    this.status = 'waiting'
    this.deliverymanId = null
    this.addDomainEvent(new OrderMarkedAsWaitingEvent(this))
  }

  static create(
    props: Optional<
      OrderProps,
      'createdAt' | 'status' | 'deliverymanId' | 'deliveryPhotoUrl'
    >,
    id?: UniqueEntityId,
  ) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        status: props.status ?? 'waiting',
        deliverymanId: props.deliverymanId ?? undefined,
        deliveryPhotoUrl: props.deliveryPhotoUrl ?? undefined,
      },
      id,
    )

    const isNewOrder = !id
    if (isNewOrder) {
      order.addDomainEvent(new OrderCreatedEvent(order))
    }

    return order
  }
}
