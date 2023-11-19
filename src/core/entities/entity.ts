import { UniqueIdEntityId } from './unique-entity-id'

export abstract class Entity<Props> {
  private _id: UniqueIdEntityId

  protected props: Props

  get id() {
    return this._id
  }

  protected constructor(props: Props, id?: UniqueIdEntityId) {
    this.props = props
    this._id = id ?? new UniqueIdEntityId()
  }

  public equals(entity: Entity<unknown>) {
    if (entity === this) return true

    if (entity.id === this._id) return true

    return false
  }
}
