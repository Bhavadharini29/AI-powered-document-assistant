package com.example.repository;

import com.example.model.SupportFAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportFAQRepository extends JpaRepository<SupportFAQ, Long> {
}
