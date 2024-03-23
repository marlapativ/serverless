import { DataTypes, Model } from 'sequelize'
import database from '../config/database'

/**
 * The Email model
 */
class Email extends Model {
  public id!: string
  public user_id!: string
  public email_type!: string
  public send_date!: Date
  public email_created!: Date
  public email_updated!: Date
}

Email.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    send_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    email_type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize: database.getDatabaseConnection(),
    modelName: 'Email',
    tableName: 'Email',
    timestamps: true,
    createdAt: 'email_created',
    updatedAt: 'email_updated'
  }
)

export default Email
