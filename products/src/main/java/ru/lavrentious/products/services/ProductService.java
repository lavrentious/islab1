package ru.lavrentious.products.services;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ru.lavrentious.products.dto.CreateProductDTO;
import ru.lavrentious.products.entities.Product;
import ru.lavrentious.products.entities.Store;
import ru.lavrentious.products.repositories.ProductRepository;
import ru.lavrentious.products.utils.LogCacheStats;

@Service
public class ProductService {
  private final ProductRepository productRepository;
  private final StoreService storeService;

  public ProductService(ProductRepository productRepository, StoreService storeService) {
    this.productRepository = productRepository;
    this.storeService = storeService;
  }

  @LogCacheStats
  public List<Product> getAll() {
    return this.productRepository.findAll();
  }

  public Product create(CreateProductDTO dto) {
    if (dto == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dto must not be null");
    }

    Store store = this.storeService.get(dto.getStoreId());
    if (store == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "store not found for ID: " + dto.getStoreId());
    }

    Product product = new Product();
    product.setName(dto.getName());
    product.setPrice(dto.getPrice());
    product.setStore(store);
    return this.productRepository.save(product);
  }

  @LogCacheStats
  public Product get(Long id) {
    if (id == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "product id must not be null");
    }
    return this.productRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "product not found for ID: " + id));
  }

  public void testConnectionPool() {
    System.err.println("testing connection pool...");
    ExecutorService executor = Executors.newFixedThreadPool(10);

    for (int i = 0; i < 50; i++) {
      executor.submit(() -> {
        Product p = this.get(1L);
        System.out.println(p.getName());
      });
    }

    executor.shutdown();
  }
}
