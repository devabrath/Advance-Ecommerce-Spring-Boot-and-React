package com.cart.ecom_proj.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
) throws ServletException, IOException {

    System.out.println("=================================");
    System.out.println("JWT FILTER HIT");
    System.out.println("URI: " + request.getRequestURI());

    final String authHeader =
            request.getHeader("Authorization");

    System.out.println("AUTH HEADER: " + authHeader);
    System.out.println("=================================");

    String username = null;
    String jwt = null;

    if (authHeader != null
            && authHeader.startsWith("Bearer ")) {

        jwt = authHeader.substring(7);

        try {
            username = jwtService.extractUsername(jwt);

            System.out.println("EXTRACTED USERNAME: " + username);

        } catch (Exception e) {

            System.out.println("JWT ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }

    if (username != null
            && SecurityContextHolder
            .getContext()
            .getAuthentication() == null) {

        UserDetails userDetails =
                userDetailsService.loadUserByUsername(username);

        if (jwtService.isTokenValid(jwt, userDetails)) {

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            System.out.println(
                    "JWT USER: " + userDetails.getUsername()
            );

            System.out.println(
                    "JWT AUTHORITIES: "
                            + userDetails.getAuthorities()
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

        } else {
            System.out.println("JWT IS NOT VALID");
        }
    }

    filterChain.doFilter(request, response);
}
}