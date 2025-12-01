package ru.lavrentious.products.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import ru.lavrentious.products.dto.CreateStoreDTO;
import ru.lavrentious.products.entities.Store;
import ru.lavrentious.products.services.StoreService;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
public class StoreController {
  private final StoreService storeService;

  @GetMapping({ "/", "" })
  public List<Store> getAll() {
    return this.storeService.getAll();
  }

  @PostMapping({ "/", "" })
  public Store create(@RequestBody CreateStoreDTO dto) {
    if (dto == null) {
      throw new IllegalArgumentException();
    }
    return this.storeService.create(dto);
  }

  @GetMapping("/{id}")
  public Store get(@PathVariable Long id) {
    if (id == null) {
      throw new IllegalArgumentException();
    }
    return this.storeService.get(id);
  }
}
