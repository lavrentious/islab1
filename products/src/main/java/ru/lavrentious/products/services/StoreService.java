package ru.lavrentious.products.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ru.lavrentious.products.dto.CreateStoreDTO;
import ru.lavrentious.products.entities.Store;
import ru.lavrentious.products.repositories.StoreRepository;
import ru.lavrentious.products.utils.LogCacheStats;

@Service
public class StoreService {
  private final StoreRepository storeRepository;

  public StoreService(StoreRepository storeRepository) {
    this.storeRepository = storeRepository;
  }

  @LogCacheStats
  public List<Store> getAll() {
    return storeRepository.findAll();
  }

  public Store create(CreateStoreDTO dto) {
    if (dto == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dto must not be null");
    }
    Store store = new Store();
    store.setName(dto.getName());
    store.setAddress(dto.getAddress());
    store.setRating(dto.getRating());
    return storeRepository.save(store);
  }

  @LogCacheStats
  public Store get(Long id) {
    if (id == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "store id must not be null");
    }
    return storeRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "store not found for ID: " + id));
  }
}
