import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';


const mockServiceService = () => ({
  getAllServices: jest.fn(),
});

describe('ServiceController', () => {
  let controller: ServiceController;
  let serviceService: ReturnType<typeof mockServiceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: ServiceService,
          useFactory: mockServiceService,
        },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
    serviceService = module.get(ServiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllServices', () => {
    it('should return all services', async () => {
      const services = [
        { name: 'Bilgisayar Tamiri', description: 'Masaüstü ve dizüstü bilgisayar tamir hizmetleri.', price: 150 },
        { name: 'Telefon Tamiri', description: 'Akıllı telefon ekran değişimi ve diğer tamir hizmetleri.', price: 100 },
      ];

      serviceService.getAllServices.mockResolvedValue(services);

      const result = await controller.getAllServices();

      expect(result).toEqual(services);
      expect(serviceService.getAllServices).toHaveBeenCalled();
    });
  });
});
