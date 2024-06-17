import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';

@Injectable()
export class ServiceService implements OnModuleInit {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async onModuleInit() {
    const services = [
      {
        name: 'Bilgisayar Tamiri',
        description: 'Masaüstü ve dizüstü bilgisayar tamir hizmetleri.',
        price: 150,
      },
      {
        name: 'Telefon Tamiri',
        description: 'Akıllı telefon ekran değişimi ve diğer tamir hizmetleri.',
        price: 100,
      },
      {
        name: 'Yazıcı Tamiri',
        description: 'Yazıcı bakım ve onarım hizmetleri.',
        price: 120,
      },
      {
        name: 'Ağ Kurulumu',
        description: 'Ev ve ofis ağ kurulumu hizmetleri.',
        price: 200,
      },
    ];

    for (const service of services) {
      const existingService = await this.serviceRepository.findOne({ where: { name: service.name } });
      if (!existingService) {
        const newService = this.serviceRepository.create(service);
        await this.serviceRepository.save(newService);
      }
    }
  }

  async getAllServices(): Promise<any[]> {
    const services = await this.serviceRepository.find();
    return services.map(service => ({
      name: service.name,
      description: service.description,
      price: service.price,
    }));
  }

 
}
