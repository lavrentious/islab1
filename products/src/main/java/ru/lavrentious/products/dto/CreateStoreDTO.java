package ru.lavrentious.products.dto;

import lombok.Data;

@Data
public class CreateStoreDTO {
  private String name;
  private String address;
  private Integer rating;
}
