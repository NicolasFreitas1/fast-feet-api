import { Module } from '@nestjs/common'
import { StorageUploader } from '@/domain/delivery/application/storage/storage-uploader'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { LocalStorageUploader } from './local-storage-uploader'
import { R2StorageUploader } from './r2-storage-uploader'

@Module({
  imports: [EnvModule],
  providers: [
    LocalStorageUploader,
    R2StorageUploader,
    {
      provide: StorageUploader,
      inject: [EnvService, LocalStorageUploader, R2StorageUploader],
      useFactory: (
        env: EnvService,
        localStorageUploader: LocalStorageUploader,
        r2StorageUploader: R2StorageUploader,
      ) => {
        return env.get('STORAGE_DRIVER') === 'r2'
          ? r2StorageUploader
          : localStorageUploader
      },
    },
  ],
  exports: [StorageUploader],
})
export class StorageModule {}
