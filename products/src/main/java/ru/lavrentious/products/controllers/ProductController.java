package ru.lavrentious.products.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import ru.lavrentious.products.dto.CreateProductDTO;
import ru.lavrentious.products.entities.Product;
import ru.lavrentious.products.services.ProductService;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {
  private final ProductService productService;

  @GetMapping({ "/", "" })
  public List<Product> getAll() {
    return this.productService.getAll();
  }

  @PostMapping({ "/", "" })
  public Product create(@RequestBody CreateProductDTO dto) {
    if (dto == null) {
      throw new IllegalArgumentException();
    }
    return this.productService.create(dto);
  }

  @GetMapping({ "/{id}", "/{id}/" })
  public Product get(@PathVariable Long id) {
    if (id == null) {
      throw new IllegalArgumentException();
    }
    return this.productService.get(id);
  }

  @PostMapping({ "/test", "/test/" })
  public void test() {
    this.productService.testConnectionPool();
  }
}
