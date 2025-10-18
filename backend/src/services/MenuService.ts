import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateMenuInput {
  name: string;
  location?: string; // primary, footer, sidebar, mobile
  items?: CreateMenuItemInput[];
}

interface CreateMenuItemInput {
  title: string;
  url?: string;
  type?: string; // custom, page, post, category, external
  targetId?: number;
  icon?: string;
  cssClass?: string;
  target?: string; // _self, _blank, _parent, _top
  parentId?: number;
  order?: number;
}

interface UpdateMenuInput {
  name?: string;
  location?: string;
}

interface UpdateMenuItemInput {
  title?: string;
  url?: string;
  type?: string;
  targetId?: number;
  icon?: string;
  cssClass?: string;
  target?: string;
  parentId?: number;
  order?: number;
}

class MenuService {
  /**
   * Generate URL-friendly slug
   */
  private generateSlug(name: string): string {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    let slug = name.toLowerCase();
    Object.keys(turkishMap).forEach(key => {
      slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
    });
    slug = slug.replace(/[^a-z0-9]+/g, '-');
    slug = slug.replace(/^-+|-+$/g, '');
    return slug;
  }

  /**
   * Ensure unique slug
   */
  private async ensureUniqueSlug(
    companyId: number,
    baseSlug: string,
    excludeMenuId?: number
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.menu.findFirst({
        where: {
          companyId,
          slug,
          ...(excludeMenuId ? { id: { not: excludeMenuId } } : {})
        }
      });

      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // ============================================
  // MENU MANAGEMENT
  // ============================================

  /**
   * Create menu
   */
  async createMenu(companyId: number, data: CreateMenuInput) {
    const baseSlug = this.generateSlug(data.name);
    const slug = await this.ensureUniqueSlug(companyId, baseSlug);

    const menu = await prisma.menu.create({
      data: {
        companyId,
        name: data.name,
        slug,
        location: data.location || 'primary'
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    // Add menu items if provided
    if (data.items && data.items.length > 0) {
      for (const itemData of data.items) {
        await this.addMenuItem(menu.id, companyId, itemData);
      }
    }

    return this.getMenuById(menu.id, companyId);
  }

  /**
   * Get menu by ID
   */
  async getMenuById(menuId: number, companyId: number) {
    const menu = await prisma.menu.findFirst({
      where: {
        id: menuId,
        companyId
      },
      include: {
        items: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return menu;
  }

  /**
   * Get menu by slug
   */
  async getMenuBySlug(slug: string, companyId: number) {
    const menu = await prisma.menu.findFirst({
      where: {
        slug,
        companyId
      },
      include: {
        items: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return menu;
  }

  /**
   * Get menu by location
   */
  async getMenuByLocation(location: string, companyId: number) {
    const menu = await prisma.menu.findFirst({
      where: {
        location,
        companyId
      },
      include: {
        items: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return menu;
  }

  /**
   * List all menus
   */
  async listMenus(companyId: number) {
    const menus = await prisma.menu.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return menus;
  }

  /**
   * Update menu
   */
  async updateMenu(
    menuId: number,
    companyId: number,
    data: UpdateMenuInput
  ) {
    const existing = await prisma.menu.findFirst({
      where: { id: menuId, companyId }
    });

    if (!existing) {
      throw new Error('Menu not found');
    }

    let slug: string | undefined;
    if (data.name) {
      const baseSlug = this.generateSlug(data.name);
      slug = await this.ensureUniqueSlug(companyId, baseSlug, menuId);
    }

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
        ...(data.location && { location: data.location })
      },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return menu;
  }

  /**
   * Delete menu
   */
  async deleteMenu(menuId: number, companyId: number) {
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, companyId }
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    // Cascade delete will handle menu items
    await prisma.menu.delete({
      where: { id: menuId }
    });

    return { success: true, message: 'Menu deleted successfully' };
  }

  /**
   * Duplicate menu
   */
  async duplicateMenu(menuId: number, companyId: number) {
    const original = await prisma.menu.findFirst({
      where: { id: menuId, companyId },
      include: {
        items: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      }
    });

    if (!original) {
      throw new Error('Menu not found');
    }

    const newName = `${original.name} (Copy)`;
    const baseSlug = this.generateSlug(newName);
    const slug = await this.ensureUniqueSlug(companyId, baseSlug);

    const newMenu = await prisma.menu.create({
      data: {
        companyId,
        name: newName,
        slug,
        location: original.location
      }
    });

    // Duplicate items (flat structure first)
    const itemMap = new Map<number, number>(); // old ID -> new ID

    // First pass: create all items without parent relationships
    for (const item of original.items) {
      const newItem = await prisma.menuItem.create({
        data: {
          menuId: newMenu.id,
          title: item.title,
          url: item.url,
          type: item.type,
          targetId: item.targetId,
          icon: item.icon,
          cssClass: item.cssClass,
          target: item.target,
          order: item.order
        }
      });
      itemMap.set(item.id, newItem.id);

      // Handle children
      for (const child of item.children) {
        const newChild = await prisma.menuItem.create({
          data: {
            menuId: newMenu.id,
            title: child.title,
            url: child.url,
            type: child.type,
            targetId: child.targetId,
            icon: child.icon,
            cssClass: child.cssClass,
            target: child.target,
            order: child.order
          }
        });
        itemMap.set(child.id, newChild.id);

        // Handle grandchildren
        for (const grandchild of child.children) {
          const newGrandchild = await prisma.menuItem.create({
            data: {
              menuId: newMenu.id,
              title: grandchild.title,
              url: grandchild.url,
              type: grandchild.type,
              targetId: grandchild.targetId,
              icon: grandchild.icon,
              cssClass: grandchild.cssClass,
              target: grandchild.target,
              order: grandchild.order
            }
          });
          itemMap.set(grandchild.id, newGrandchild.id);
        }
      }
    }

    // Second pass: update parent relationships
    for (const item of original.items) {
      if (item.parentId && itemMap.has(item.parentId)) {
        const newItemId = itemMap.get(item.id);
        const newParentId = itemMap.get(item.parentId);
        
        if (newItemId && newParentId) {
          await prisma.menuItem.update({
            where: { id: newItemId },
            data: { parentId: newParentId }
          });
        }
      }

      for (const child of item.children) {
        const newChildId = itemMap.get(child.id);
        const newParentId = itemMap.get(item.id);
        
        if (newChildId && newParentId) {
          await prisma.menuItem.update({
            where: { id: newChildId },
            data: { parentId: newParentId }
          });
        }

        for (const grandchild of child.children) {
          const newGrandchildId = itemMap.get(grandchild.id);
          const newParentId = itemMap.get(child.id);
          
          if (newGrandchildId && newParentId) {
            await prisma.menuItem.update({
              where: { id: newGrandchildId },
              data: { parentId: newParentId }
            });
          }
        }
      }
    }

    return this.getMenuById(newMenu.id, companyId);
  }

  // ============================================
  // MENU ITEM MANAGEMENT
  // ============================================

  /**
   * Add menu item
   */
  async addMenuItem(
    menuId: number,
    companyId: number,
    data: CreateMenuItemInput
  ) {
    // Verify menu exists and belongs to company
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, companyId }
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    // Get max order for auto-ordering
    const maxOrder = await prisma.menuItem.aggregate({
      where: {
        menuId,
        parentId: data.parentId || null
      },
      _max: { order: true }
    });

    const order = data.order !== undefined ? data.order : (maxOrder._max.order || 0) + 1;

    const menuItem = await prisma.menuItem.create({
      data: {
        menuId,
        title: data.title,
        url: data.url,
        type: data.type || 'custom',
        targetId: data.targetId,
        icon: data.icon,
        cssClass: data.cssClass,
        target: data.target || '_self',
        parentId: data.parentId,
        order
      },
      include: {
        parent: true,
        children: true
      }
    });

    return menuItem;
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(itemId: number) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        menu: true,
        parent: true,
        children: {
          include: {
            children: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return menuItem;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    itemId: number,
    companyId: number,
    data: UpdateMenuItemInput
  ) {
    const existing = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { menu: true }
    });

    if (!existing || existing.menu.companyId !== companyId) {
      throw new Error('Menu item not found');
    }

    const menuItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.type && { type: data.type }),
        ...(data.targetId !== undefined && { targetId: data.targetId }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.cssClass !== undefined && { cssClass: data.cssClass }),
        ...(data.target && { target: data.target }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
        ...(data.order !== undefined && { order: data.order })
      },
      include: {
        parent: true,
        children: true
      }
    });

    return menuItem;
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(itemId: number, companyId: number) {
    const existing = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        menu: true,
        children: true
      }
    });

    if (!existing || existing.menu.companyId !== companyId) {
      throw new Error('Menu item not found');
    }

    if (existing.children.length > 0) {
      throw new Error('Cannot delete menu item with children. Delete children first or reassign them.');
    }

    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    return { success: true, message: 'Menu item deleted successfully' };
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(
    menuId: number,
    companyId: number,
    itemOrders: { itemId: number; order: number; parentId?: number | null }[]
  ) {
    // Verify menu belongs to company
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, companyId }
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    // Update all items
    const updates = await Promise.allSettled(
      itemOrders.map(({ itemId, order, parentId }) =>
        prisma.menuItem.updateMany({
          where: {
            id: itemId,
            menuId
          },
          data: {
            order,
            ...(parentId !== undefined && { parentId })
          }
        })
      )
    );

    return {
      success: true,
      updated: updates.filter(u => u.status === 'fulfilled').length,
      failed: updates.filter(u => u.status === 'rejected').length
    };
  }

  /**
   * Bulk add menu items from pages
   */
  async addPagesAsMenuItems(
    menuId: number,
    companyId: number,
    pageIds: number[]
  ) {
    // Verify menu
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, companyId }
    });

    if (!menu) {
      throw new Error('Menu not found');
    }

    // Get pages
    const pages = await prisma.cMSPage.findMany({
      where: {
        id: { in: pageIds },
        companyId
      }
    });

    if (pages.length === 0) {
      throw new Error('No valid pages found');
    }

    // Get max order
    const maxOrder = await prisma.menuItem.aggregate({
      where: { menuId, parentId: null },
      _max: { order: true }
    });

    let order = (maxOrder._max.order || 0) + 1;

    // Create menu items
    const items = await Promise.all(
      pages.map(page =>
        prisma.menuItem.create({
          data: {
            menuId,
            title: page.title,
            type: 'page',
            targetId: page.id,
            url: `/pages/${page.slug}`,
            order: order++
          }
        })
      )
    );

    return { success: true, added: items.length };
  }

  /**
   * Get menu statistics
   */
  async getMenuStatistics(companyId: number) {
    const [totalMenus, totalItems] = await Promise.all([
      prisma.menu.count({ where: { companyId } }),
      prisma.menuItem.count({
        where: {
          menu: { companyId }
        }
      })
    ]);

    const menusByLocation = await prisma.menu.groupBy({
      by: ['location'],
      where: { companyId },
      _count: true
    });

    return {
      totalMenus,
      totalItems,
      byLocation: menusByLocation.reduce((acc, curr) => {
        acc[curr.location] = curr._count;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export default new MenuService();
