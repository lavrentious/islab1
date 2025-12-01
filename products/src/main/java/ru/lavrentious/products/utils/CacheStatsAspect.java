package ru.lavrentious.products.utils;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;

@Aspect
@Component
@RequiredArgsConstructor
public class CacheStatsAspect {

  private final EntityManagerFactory emf;

  @Value("${app.cache.stats.enabled:true}")
  private boolean enabled;

  @Around("@annotation(LogCacheStats)")
  public Object logStats(ProceedingJoinPoint joinPoint) throws Throwable {
    Object result = joinPoint.proceed();
    if (enabled) {
      SessionFactory sessionFactory = emf.unwrap(SessionFactory.class);
      Statistics stats = sessionFactory.getStatistics();
      stats.setStatisticsEnabled(true);
      System.out.println("l2 cache hits: " + stats.getSecondLevelCacheHitCount());
      System.out.println("l2 cache misses: " + stats.getSecondLevelCacheMissCount());
    }
    return result;
  }
}
