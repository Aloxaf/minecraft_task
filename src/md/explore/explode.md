

# Minecraft爆炸算法



MC中的爆炸其实挺科学的，在空中爆炸冲击波传得远，破坏范围比较大；在地面爆炸破坏范围小但是破坏深度较深

不科学的地方是它的爆炸范围是正方体，只不过一般范围小到看不出是正方体。至于为什么MOD里的核弹爆炸范围是球体，那是别人重新实现了爆炸函数把范围改掉了…

![Alt text](/img/爆炸.jpg "爆炸")

类名net.minecraft.world.World

```java


    /**
     * Creates an explosion. Args: entity, x, y, z, strength
     */
    public Explosion createExplosion(Entity entityIn, double x, double y, double z, float strength, boolean isSmoking)
    {
        return this.newExplosion(entityIn, x, y, z, strength, false, isSmoking);
    }

    /**
     * returns a new explosion. Does initiation (at time of writing Explosion is not finished)
     */
    // isFlaming影响是否着火，isSmoking影响是否生成粒子和破坏方块
    public Explosion newExplosion(Entity entityIn, double x, double y, double z, float strength, boolean isFlaming, boolean isSmoking)
    {
        Explosion explosion = new Explosion(this, entityIn, x, y, z, strength, isFlaming, isSmoking);
        if (net.minecraftforge.event.ForgeEventFactory.onExplosionStart(this, explosion)) return explosion;
        // 第一阶段，计算被破坏的方块，伤害实体
        explosion.doExplosionA();
        // 第二阶段，破坏方块，生成粒子效果和掉落物
        explosion.doExplosionB(true);
        return explosion;
    }
```
爆炸辐射和半径如下:

![Alt text](/img/爆炸辐射.png"辐射")      ![Alt text](/img/爆炸伤害半径.png"半径")

类名net.minecraft.world.Explosion

```java

    public Explosion(World worldIn, Entity p_i45754_2_, double p_i45754_3_, double p_i45754_5_, double p_i45754_7_, float size, boolean p_i45754_10_, boolean p_i45754_11_)
    {
        this.explosionRNG = new Random();
        this.affectedBlockPositions = Lists.<BlockPos>newArrayList();
        this.playerKnockbackMap = Maps.<EntityPlayer, Vec3>newHashMap();
        this.worldObj = worldIn;
        this.exploder = p_i45754_2_;
        // 就是上面的strength
        this.explosionSize = size;
        this.explosionX = p_i45754_3_;
        this.explosionY = p_i45754_5_;
        this.explosionZ = p_i45754_7_;
        this.isFlaming = p_i45754_10_;
        this.isSmoking = p_i45754_11_;
        this.position = new Vec3(explosionX, explosionY, explosionZ);
    }

    /**
     * Does the first part of the explosion (destroy blocks)
     */
    public void doExplosionA()
    {
        Set<BlockPos> blocksToDestroy = Sets.<BlockPos>newHashSet();

        // 遍历16*16*16正方体边界上各点，从中心向边界连线，计算是否破坏连线上的方块
        // 由于这里正方体尺寸写死了，如果爆炸范围太大边界就会有些方块没有遍历到
        for (int x = 0; x < 16; ++x)
        {
            for (int y = 0; y < 16; ++y)
            {
                for (int z = 0; z < 16; ++z)
                {
                    // 在边界
                    if (x == 0 || x == 15 || y == 0 || y == 15 || z == 0 || z == 15)
                    {
                        // 这里只有-1或1两个取值
                        double xStep = (double)((float)x / 15.0F * 2.0F - 1.0F);
                        double yStep = (double)((float)y / 15.0F * 2.0F - 1.0F);
                        double zStep = (double)((float)z / 15.0F * 2.0F - 1.0F);
                        // 归一化
                        double step = Math.sqrt(xStep * xStep + yStep * yStep + zStep * zStep);
                        xStep = xStep / step;
                        yStep = yStep / step;
                        zStep = zStep / step;

                        // 当前爆炸强度，随着距离和经过的方块衰减
                        float strength = this.explosionSize * (0.7F + this.worldObj.rand.nextFloat() * 0.6F);
                        double blockX = this.explosionX;
                        double blockY = this.explosionY;
                        double blockZ = this.explosionZ;

                        for (; strength > 0.0F; strength -= 0.22500001F)
                        {
                            BlockPos blockPos = new BlockPos(blockX, blockY, blockZ);
                            IBlockState block = this.worldObj.getBlockState(blockPos);

                            // 爆炸强度衰减
                            if (block.getBlock().getMaterial() != Material.air)
                            {
                                float resistance = this.exploder != null ? this.exploder.getExplosionResistance(this, this.worldObj, blockPos, block) : block.getBlock().getExplosionResistance(worldObj, blockPos, (Entity)null, this);
                                strength -= (resistance + 0.3F) * 0.3F;
                            }

                            // 把这个方块加入准备破坏的方块
                            if (strength > 0.0F && (this.exploder == null || this.exploder.verifyExplosion(this, this.worldObj, blockPos, block, strength)))
                            {
                                blocksToDestroy.add(blockPos);
                            }

                            blockX += xStep * 0.30000001192092896D;
                            blockY += yStep * 0.30000001192092896D;
                            blockZ += zStep * 0.30000001192092896D;
                        }
                    }
                }
            }
        }

        // 把set转为array
        this.affectedBlockPositions.addAll(blocksToDestroy);

        // 接下来伤害实体

        // 取包围盒内的实体
        float explosionSize = this.explosionSize * 2.0F;
        int minX = MathHelper.floor_double(this.explosionX - (double)explosionSize - 1.0D);
        int maxX = MathHelper.floor_double(this.explosionX + (double)explosionSize + 1.0D);
        int minY = MathHelper.floor_double(this.explosionY - (double)explosionSize - 1.0D);
        int maxY = MathHelper.floor_double(this.explosionY + (double)explosionSize + 1.0D);
        int minZ = MathHelper.floor_double(this.explosionZ - (double)explosionSize - 1.0D);
        int maxZ = MathHelper.floor_double(this.explosionZ + (double)explosionSize + 1.0D);
        List<Entity> entityList = this.worldObj.getEntitiesWithinAABBExcludingEntity(this.exploder, new AxisAlignedBB((double)minX, (double)minY, (double)minZ, (double)maxX, (double)maxY, (double)maxZ));
        net.minecraftforge.event.ForgeEventFactory.onExplosionDetonate(this.worldObj, this, entityList, explosionSize);

        Vec3 vec3 = new Vec3(this.explosionX, this.explosionY, this.explosionZ);

        for (int i = 0; i < entityList.size(); ++i)
        {
            Entity entity = (Entity)entityList.get(i);

            // 实体不免疫爆炸
            if (!entity.isImmuneToExplosions())
            {
                // 用来判断是否在爆炸范围内的距离
                double _dist = entity.getDistance(this.explosionX, this.explosionY, this.explosionZ) / (double)explosionSize;

                if (_dist <= 1.0D)
                {
                    // 用来计算击退方向的距离
                    double xDist = entity.posX - this.explosionX;
                    double yDist = entity.posY + (double)entity.getEyeHeight() - this.explosionY;
                    double zDist = entity.posZ - this.explosionZ;
                    double dist = (double)MathHelper.sqrt_double(xDist * xDist + yDist * yDist + zDist * zDist);

                    if (dist != 0.0D) // 这句基本没用，只是防止除数为0吧
                    {
                        // 归一化
                        xDist = xDist / dist;
                        yDist = yDist / dist;
                        zDist = zDist / dist;

                        // 从爆炸中心到实体边界上各点连线，中间没有方块挡住的比例，即实体受到爆炸影响的比例
                        double strengthScale = (double)this.worldObj.getBlockDensity(vec3, entity.getEntityBoundingBox());
                        double strength = (1.0D - _dist) * strengthScale;
                        // 伤害实体
                        entity.attackEntityFrom(DamageSource.setExplosionSource(this), (float)((int)((strength * strength + strength) / 2.0D * 8.0D * (double)explosionSize + 1.0D)));
                        // 击退，附魔爆炸保护会减少击退
                        double motionScale = EnchantmentProtection.func_92092_a(entity, strength);
                        entity.motionX += xDist * motionScale;
                        entity.motionY += yDist * motionScale;
                        entity.motionZ += zDist * motionScale;

                        // 记录玩家击退
                        if (entity instanceof EntityPlayer && !((EntityPlayer)entity).capabilities.disableDamage)
                        {
                            this.playerKnockbackMap.put((EntityPlayer)entity, new Vec3(xDist * strength, yDist * strength, zDist * strength));
                        }
                    }
                }
            }
        }
    }

    /**
     * Does the second part of the explosion (sound, particles, drop spawn)
     */
    public void doExplosionB(boolean spawnParticles)
    {
        // 播放爆炸音效
        this.worldObj.playSoundEffect(this.explosionX, this.explosionY, this.explosionZ, "random.explode", 4.0F, (1.0F + (this.worldObj.rand.nextFloat() - this.worldObj.rand.nextFloat()) * 0.2F) * 0.7F);

        // 生成大爆炸粒子效果
        if (this.explosionSize >= 2.0F && this.isSmoking)
        {
            this.worldObj.spawnParticle(EnumParticleTypes.EXPLOSION_HUGE, this.explosionX, this.explosionY, this.explosionZ, 1.0D, 0.0D, 0.0D, new int[0]);
        }
        else
        {
            this.worldObj.spawnParticle(EnumParticleTypes.EXPLOSION_LARGE, this.explosionX, this.explosionY, this.explosionZ, 1.0D, 0.0D, 0.0D, new int[0]);
        }

        // 破坏方块
        if (this.isSmoking)
        {
            // 遍历被破坏的方块
            for (BlockPos blockpos : this.affectedBlockPositions)
            {
                Block block = this.worldObj.getBlockState(blockpos).getBlock();

                // 生成爆炸和烟粒子效果
                if (spawnParticles)
                {
                    double x = (double)((float)blockpos.getX() + this.worldObj.rand.nextFloat());
                    double y = (double)((float)blockpos.getY() + this.worldObj.rand.nextFloat());
                    double z = (double)((float)blockpos.getZ() + this.worldObj.rand.nextFloat());

                    double xDist = x - this.explosionX;
                    double yDist = y - this.explosionY;
                    double zDist = z - this.explosionZ;
                    double dist = (double)MathHelper.sqrt_double(xDist * xDist + yDist * yDist + zDist * zDist);
                    // 归一化
                    xDist = xDist / dist;
                    yDist = yDist / dist;
                    zDist = zDist / dist;

                    double distScale = 0.5D / (dist / (double)this.explosionSize + 0.1D);
                    distScale = distScale * (double)(this.worldObj.rand.nextFloat() * this.worldObj.rand.nextFloat() + 0.3F);
                    xDist = xDist * distScale;
                    yDist = yDist * distScale;
                    zDist = zDist * distScale;

                    this.worldObj.spawnParticle(EnumParticleTypes.EXPLOSION_NORMAL, (x + this.explosionX ) / 2.0D, (y + this.explosionY) / 2.0D, (z + this.explosionZ) / 2.0D, xDist, yDist, zDist, new int[0]);
                    this.worldObj.spawnParticle(EnumParticleTypes.SMOKE_NORMAL, x, y, z, xDist, yDist, zDist, new int[0]);
                }

                // 破坏方块
                if (block.getMaterial() != Material.air)
                {
                    if (block.canDropFromExplosion(this))
                    {
                        block.dropBlockAsItemWithChance(this.worldObj, blockpos, this.worldObj.getBlockState(blockpos), 1.0F / this.explosionSize, 0);
                    }

                    block.onBlockExploded(this.worldObj, blockpos, this);
                }
            }
        }

        // 着火
        if (this.isFlaming)
        {
            for (BlockPos blockpos1 : this.affectedBlockPositions)
            {
                if (   this.worldObj.getBlockState(blockpos1).getBlock().getMaterial() == Material.air
                    && this.worldObj.getBlockState(blockpos1.down()).getBlock().isFullBlock()
                    && this.explosionRNG.nextInt(3) == 0)
                {
                    this.worldObj.setBlockState(blockpos1, Blocks.fire.getDefaultState());
                }
            }
        }
    }
```



这个函数用来计算实体暴露给爆炸中心的比例，代表受到爆炸的影响

类名net.minecraft.world.World

```java
    /**
     * Gets the percentage of real blocks within within a bounding box, along a specified vector.
     */
    public float getBlockDensity(Vec3 vec, AxisAlignedBB bb)
    {
        double xStep = 1.0D / ((bb.maxX - bb.minX) * 2.0D + 1.0D);
        double yStep = 1.0D / ((bb.maxY - bb.minY) * 2.0D + 1.0D);
        double zStep = 1.0D / ((bb.maxZ - bb.minZ) * 2.0D + 1.0D);
        double xOffset = (1.0D - Math.floor(1.0D / xStep) * xStep) / 2.0D;
        double zOffset = (1.0D - Math.floor(1.0D / zStep) * zStep) / 2.0D;

        if (xStep >= 0.0D && yStep >= 0.0D && zStep >= 0.0D)
        {
            int noBlockLines = 0;
            int totalLines = 0;

            // xt、yt、zt为插值参数
            for (float xt = 0.0F; xt <= 1.0F; xt = (float)((double)xt + xStep))
            {
                for (float yt = 0.0F; yt <= 1.0F; yt = (float)((double)yt + yStep))
                {
                    for (float zt = 0.0F; zt <= 1.0F; zt = (float)((double)zt + zStep))
                    {
                        double x = bb.minX + (bb.maxX - bb.minX) * (double)xt;
                        double y = bb.minY + (bb.maxY - bb.minY) * (double)yt;
                        double z = bb.minZ + (bb.maxZ - bb.minZ) * (double)zt;

                        // 爆炸中心到包围盒上这个点之间没有方块。rayTraceBlocks在我之前的博文逆向过了
                        if (this.rayTraceBlocks(new Vec3(x + xOffset, y, z + zOffset), vec) == null)
                        {
                            ++noBlockLines;
                        }

                        ++totalLines;
                    }
                }
            }

            return (float)noBlockLines / (float)totalLines;
        }
        else
        {
            return 0.0F;
        }
    }
```

以上内容来自: [CSDN博客](https://blog.csdn.net/xfgryujk/article/details/68943594)
