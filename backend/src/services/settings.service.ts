import { env } from '../config/env.js';
import {
  defaultEmailTemplate,
  StoreSettings,
  type IStoreSettings,
} from '../models/StoreSettings.model.js';
import type { HydratedDocument } from 'mongoose';

export async function getStoreSettings(): Promise<HydratedDocument<IStoreSettings>> {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({
      storeName: 'EBookN',
      storeLogo: null,
      contactEmail: env.ADMIN_EMAIL,
      emailTemplate: defaultEmailTemplate,
    });
  }
  return settings;
}
