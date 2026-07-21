package com.macro.mall.service.impl;

import com.macro.mall.mapper.UmsAdminMapper;
import com.macro.mall.mapper.UmsAdminRoleRelationMapper;
import com.macro.mall.mapper.UmsPermissionMapper;
import com.macro.mall.mapper.UmsRoleMapper;
import com.macro.mall.mapper.UmsRolePermissionRelationMapper;
import com.macro.mall.model.UmsAdmin;
import com.macro.mall.model.UmsAdminExample;
import com.macro.mall.model.UmsAdminRoleRelation;
import com.macro.mall.model.UmsAdminRoleRelationExample;
import com.macro.mall.model.UmsPermission;
import com.macro.mall.model.UmsPermissionExample;
import com.macro.mall.model.UmsRole;
import com.macro.mall.model.UmsRolePermissionRelation;
import com.macro.mall.model.UmsRolePermissionRelationExample;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UmsAdminUserDetailsService implements UserDetailsService {

    @Autowired
    private UmsAdminMapper adminMapper;

    @Autowired
    private UmsAdminRoleRelationMapper adminRoleRelationMapper;

    @Autowired
    private UmsRoleMapper roleMapper;

    @Autowired
    private UmsRolePermissionRelationMapper rolePermissionRelationMapper;

    @Autowired
    private UmsPermissionMapper permissionMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UmsAdmin admin;
        try {
            Long userId = Long.parseLong(username);
            admin = adminMapper.selectByPrimaryKey(userId);
        } catch (NumberFormatException e) {
            UmsAdminExample example = new UmsAdminExample();
            example.createCriteria().andUsernameEqualTo(username);
            List<UmsAdmin> adminList = adminMapper.selectByExample(example);
            admin = adminList.isEmpty() ? null : adminList.get(0);
        }
        if (admin == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        UmsAdminRoleRelationExample example = new UmsAdminRoleRelationExample();
        example.createCriteria().andAdminIdEqualTo(admin.getId());
        List<UmsAdminRoleRelation> roleRelations = adminRoleRelationMapper.selectByExample(example);
        for (UmsAdminRoleRelation roleRelation : roleRelations) {
            UmsRole role = roleMapper.selectByPrimaryKey(roleRelation.getRoleId());
            if (role != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                UmsRolePermissionRelationExample permissionExample = new UmsRolePermissionRelationExample();
                permissionExample.createCriteria().andRoleIdEqualTo(role.getId());
                List<UmsRolePermissionRelation> permissionRelations = rolePermissionRelationMapper.selectByExample(permissionExample);
                for (UmsRolePermissionRelation permissionRelation : permissionRelations) {
                    UmsPermission permission = permissionMapper.selectByPrimaryKey(permissionRelation.getPermissionId());
                    if (permission != null && permission.getValue() != null && !permission.getValue().isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getValue()));
                    }
                }
            }
        }
        return new User(String.valueOf(admin.getId()), admin.getPassword(), admin.getStatus() == 1, true, true, true, authorities);
    }
}