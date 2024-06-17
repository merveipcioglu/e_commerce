import { Test, TestingModule } from '@nestjs/testing';
import { ServiceService } from './service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { Repository } from 'typeorm';

const mockServiceRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ServiceService', () => {
  let service: ServiceService;
  let serviceRepository: MockRepository<Service>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        {
          provide: getRepositoryToken(Service),
          useFactory: mockServiceRepository,
        },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
    serviceRepository = module.get<MockRepository<Service>>(getRepositoryToken(Service));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize the services if not present', async () => {
      const services = [
        { name: 'Bilgisayar Tamiri', description: 'Masaüstü ve dizüstü bilgisayar tamir hizmetleri.', price: 150 },
        { name: 'Telefon Tamiri', description: 'Akıllı telefon ekran değişimi ve diğer tamir hizmetleri.', price: 100 },
        { name: 'Yazıcı Tamiri', description: 'Yazıcı bakım ve onarım hizmetleri.', price: 120 },
        { name: 'Ağ Kurulumu', description: 'Ev ve ofis ağ kurulumu hizmetleri.', price: 200 },
      ];

      serviceRepository.findOne.mockResolvedValue(null);
      serviceRepository.create.mockImplementation(service => service);
      serviceRepository.save.mockImplementation(service => Promise.resolve({ ...service, id: Math.random() }));

      await service.onModuleInit();

      expect(serviceRepository.findOne).toHaveBeenCalledTimes(services.length);
      expect(serviceRepository.create).toHaveBeenCalledTimes(services.length);
      expect(serviceRepository.save).toHaveBeenCalledTimes(services.length);
    });
  });

  describe('getAllServices', () => {
    it('should return all services', async () => {
      const services = [
        { id: 1, name: 'Bilgisayar Tamiri', description: 'Masaüstü ve dizüstü bilgisayar tamir hizmetleri.', price: 150 },
        { id: 2, name: 'Telefon Tamiri', description: 'Akıllı telefon ekran değişimi ve diğer tamir hizmetleri.', price: 100 },
      ];

      serviceRepository.find.mockResolvedValue(services);

      const result = await service.getAllServices();

      expect(result).toEqual(services.map(service => ({
        name: service.name,
        description: service.description,
        price: service.price,
      })));
      expect(serviceRepository.find).toHaveBeenCalled();
    });
  });
});
