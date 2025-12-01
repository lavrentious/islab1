package ru.lavrentious.products.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ru.lavrentious.products.entities.Store;

public interface StoreRepository extends JpaRepository<Store, Long> {
}
