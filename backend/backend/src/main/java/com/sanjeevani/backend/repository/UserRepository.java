package com.sanjeevani.backend.repository;
import com.sanjeevani.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    
}
