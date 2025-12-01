package ru.lavrentious.products.dto;

import lombok.Data;

@Data
public class CreateProductDTO {
  private String name;
  private Double price;
  private Long storeId;
}
