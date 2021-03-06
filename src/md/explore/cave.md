# 洞穴

有了地形接下来该生成结构和建筑了，由于这部分代码很长，本篇只研究生成洞穴

<img src="./img/Round_Cave.png" style="width: 100%;" alt="洞穴">

完整的provideChunk：

```java

    public Chunk provideChunk(int x, int z)
    {
        this.rand.setSeed((long)x * 341873128712L + (long)z * 132897987541L);
        ChunkPrimer chunkprimer = new ChunkPrimer();
        // 生成基本地形（没有洞穴等建筑）
        this.setBlocksInChunk(x, z, chunkprimer);
        // 生成16*16的生物群系数组
        this.biomesForGeneration = this.worldObj.getWorldChunkManager().loadBlockGeneratorData(this.biomesForGeneration, x * 16, z * 16, 16, 16);
        // 把石头替换成生物群系相应的方块
        this.replaceBlocksForBiome(x, z, chunkprimer, this.biomesForGeneration);

        // 生成洞穴、村庄、要塞等结构和建筑

        if (this.settings.useCaves)
        {
            this.caveGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        if (this.settings.useRavines)
        {
            this.ravineGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        if (this.settings.useMineShafts && this.mapFeaturesEnabled)
        {
            this.mineshaftGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        if (this.settings.useVillages && this.mapFeaturesEnabled)
        {
            this.villageGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        if (this.settings.useStrongholds && this.mapFeaturesEnabled)
        {
            this.strongholdGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        if (this.settings.useTemples && this.mapFeaturesEnabled)
        {
            this.scatteredFeatureGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        if (this.settings.useMonuments && this.mapFeaturesEnabled)
        {
            this.oceanMonumentGenerator.generate(this, this.worldObj, x, z, chunkprimer);
        }

        // 转为Chunk对象
        Chunk chunk = new Chunk(this.worldObj, chunkprimer, x, z);
        byte[] abyte = chunk.getBiomeArray();

        // 设置生物群系ID
        for (int i = 0; i < abyte.length; ++i)
        {
            abyte[i] = (byte)this.biomesForGeneration[i].biomeID;
        }

        // 生成光照图，这里不讨论
        chunk.generateSkylightMap();
        return chunk;
    }
```



## 生成洞穴

<img src="./img/Tree_Cave.png" style="width: 100%;" alt="洞穴">  

类名`net.minecraft.world.gen.MapGenBase`

```java

    public void generate(IChunkProvider chunkProviderIn, World worldIn, int chunkX, int chunkZ, ChunkPrimer chunkPrimerIn)
    {
        int range = this.range;
        this.worldObj = worldIn;
        this.rand.setSeed(worldIn.getSeed());
        long rand1 = this.rand.nextLong();
        long rand2 = this.rand.nextLong();

        // 遍历周围(range*2+1)*(range*2+1)的区块，默认range=8
        for (int x = chunkX - range; x <= chunkX + range; ++x)
        {
            for (int z = chunkZ - range; z <= chunkZ + range; ++z)
            {
                long j1 = (long)x * rand1;
                long k1 = (long)z * rand2;
                this.rand.setSeed(j1 ^ k1 ^ worldIn.getSeed());
                // 这个由子类实现
                this.recursiveGenerate(worldIn, x, z, chunkX, chunkZ, chunkPrimerIn);
            }
        }
    }
```

类名`net.minecraft.world.gen.MapGenCaves`

```java
public class MapGenCaves extends MapGenBase
{
    // 挖洞，默认参数
    protected void func_180703_a(long seed, int centerChunkX, int centerChunkZ, ChunkPrimer chunkPrimer, double seedPointX, double seedPointY, double seedPointZ)
    {
        this.func_180702_a(seed, centerChunkX, centerChunkZ, chunkPrimer, seedPointX, seedPointY, seedPointZ, 1.0F + this.rand.nextFloat() * 6.0F, 0.0F, 0.0F, -1, -1, 0.5D);
    }

    // 挖洞
    protected void func_180702_a(long seed, int centerChunkX, int centerChunkZ, ChunkPrimer chunkPrimer, double seedPointX, double seedPointY, double seedPointZ, float rangeScale, float yawAngle, float pitchAngle, int smallRange, int bigRange, double heightScale)
    {
        double centerBlockX = (double)(centerChunkX * 16 + 8);
        double centerBlockZ = (double)(centerChunkZ * 16 + 8);
        float yawAngleOffset = 0.0F;
        float pitchAngleOffset = 0.0F;
        Random random = new Random(seed);

        if (bigRange <= 0)
        {
            int tmp = (range - 1) * 16;
            bigRange = tmp - random.nextInt(tmp / 4);
        }

        boolean smallRangeIsNull = false;

        if (smallRange == -1)
        {
            smallRange = bigRange / 2;
            smallRangeIsNull = true;
        }

        // 可能的扩展点
        int keyPoint = random.nextInt(bigRange / 2) + bigRange / 4;

        boolean flag = random.nextInt(6) == 0;
        // 循环挖出一条道路
        for (; smallRange < bigRange; ++smallRange)
        {
            // 用sin从1到0过渡
            double xzRange = 1.5D + (double)(MathHelper.sin((float)smallRange * (float)Math.PI / (float)bigRange) * rangeScale);
            double yRange = xzRange * heightScale;
            // 向yawAngle、pitchAngle方向偏移一个单位
            float cos = MathHelper.cos(pitchAngle);
            float sin = MathHelper.sin(pitchAngle);
            seedPointX += (double)(MathHelper.cos(yawAngle) * cos);
            seedPointY += (double)sin;
            seedPointZ += (double)(MathHelper.sin(yawAngle) * cos);

            if (flag) // 1/6概率俯仰角衰减较慢
            {
                pitchAngle *= 0.92F;
            }
            else
            {
                pitchAngle *= 0.7F;
            }

            pitchAngle += pitchAngleOffset * 0.1F;
            yawAngle   += yawAngleOffset * 0.1F;
            pitchAngleOffset *= 0.9F;
            yawAngleOffset   *= 0.75F;
            pitchAngleOffset += (random.nextFloat() - random.nextFloat()) * random.nextFloat() * 2.0F;
            yawAngleOffset   += (random.nextFloat() - random.nextFloat()) * random.nextFloat() * 4.0F;

            if (   !smallRangeIsNull
                && smallRange == keyPoint
                && rangeScale > 1.0F
                && bigRange > 0)
            {
                // 向左右两边扩展
                this.func_180702_a(random.nextLong(), centerChunkX, centerChunkZ, chunkPrimer, seedPointX, seedPointY, seedPointZ, random.nextFloat() * 0.5F + 0.5F, yawAngle - ((float)Math.PI / 2F), pitchAngle / 3.0F, smallRange, bigRange, 1.0D);
                this.func_180702_a(random.nextLong(), centerChunkX, centerChunkZ, chunkPrimer, seedPointX, seedPointY, seedPointZ, random.nextFloat() * 0.5F + 0.5F, yawAngle + ((float)Math.PI / 2F), pitchAngle / 3.0F, smallRange, bigRange, 1.0D);
                return;
            }

            if (smallRangeIsNull || random.nextInt(4) != 0)
            {
                double _xDist = seedPointX - centerBlockX;
                double _zDist = seedPointZ - centerBlockZ;
                double restRange = (double)(bigRange - smallRange);
                double range = (double)(rangeScale + 2.0F + 16.0F);

                if (_xDist * _xDist + _zDist * _zDist - restRange * restRange > range * range)
                {
                    return;
                }

                // 种子点在中心方块附近（不在的话说明不在这个区块内不用管）
                if (   seedPointX >= centerBlockX - 16.0D - xzRange * 2.0D
                    && seedPointZ >= centerBlockZ - 16.0D - xzRange * 2.0D
                    && seedPointX <= centerBlockX + 16.0D + xzRange * 2.0D
                    && seedPointZ <= centerBlockZ + 16.0D + xzRange * 2.0D)
                {
                    int startX = MathHelper.floor_double(seedPointX - xzRange) - centerChunkX * 16 - 1;
                    int endX   = MathHelper.floor_double(seedPointX + xzRange) - centerChunkX * 16 + 1;
                    int endY   = MathHelper.floor_double(seedPointY - yRange) - 1;
                    int startY = MathHelper.floor_double(seedPointY + yRange) + 1;
                    int startZ = MathHelper.floor_double(seedPointZ - xzRange) - centerChunkZ * 16 - 1;
                    int endZ   = MathHelper.floor_double(seedPointZ + xzRange) - centerChunkZ * 16 + 1;

                    // 限制坐标范围

                    if (startX < 0)
                    {
                        startX = 0;
                    }

                    if (endX > 16)
                    {
                        endX = 16;
                    }

                    if (endY < 1)
                    {
                        endY = 1;
                    }

                    if (startY > 248)
                    {
                        startY = 248;
                    }

                    if (startZ < 0)
                    {
                        startZ = 0;
                    }

                    if (endZ > 16)
                    {
                        endZ = 16;
                    }

                    // 判断是不是海洋，如果在海洋则不生成洞穴

                    boolean isOcean = false;

                    for (int x = startX; !isOcean && x < endX; ++x)
                    {
                        for (int z = startZ; !isOcean && z < endZ; ++z)
                        {
                            for (int y = startY + 1; !isOcean && y >= endY - 1; --y)
                            {
                                if (y >= 0 && y < 256)
                                {
                                    if (isOceanBlock(chunkPrimer, x, y, z, centerChunkX, centerChunkZ))
                                    {
                                        isOcean = true;
                                    }

                                    // 只判断边界
                                    if (   y != endY - 1
                                        && x != startX
                                        && x != endX - 1
                                        && z != startZ
                                        && z != endZ - 1)
                                    {
                                        y = endY;
                                    }
                                }
                            }
                        }
                    }

                    if (!isOcean)
                    {
                        // 挖掉一个椭球内的方块
                        for (int x = startX; x < endX; ++x)
                        {
                            // （归一化的距离）
                            double xDist = ((double)(x + centerChunkX * 16) + 0.5D - seedPointX) / xzRange;

                            for (int z = startZ; z < endZ; ++z)
                            {
                                double zDist = ((double)(z + centerChunkZ * 16) + 0.5D - seedPointZ) / xzRange;
                                boolean _isTopBlock = false;

                                // 平面上平方距离<1
                                if (xDist * xDist + zDist * zDist < 1.0D)
                                {
                                    for (int y = startY; y > endY; --y)
                                    {
                                        double yDist = ((double)(y - 1) + 0.5D - seedPointY) / yRange;

                                        // 空间平方距离<1
                                        if (yDist > -0.7D && xDist * xDist + yDist * yDist + zDist * zDist < 1.0D)
                                        {
                                            IBlockState curBlock = chunkPrimer.getBlockState(x, y, z);
                                            IBlockState upBlock = (IBlockState)Objects.firstNonNull(chunkPrimer.getBlockState(x, y + 1, z), Blocks.air.getDefaultState());

                                            if (isTopBlock(chunkPrimer, x, y, z, centerChunkX, centerChunkZ))
                                            {
                                                _isTopBlock = true;
                                            }

                                            // 把这个方块替换为空气或岩浆
                                            digBlock(chunkPrimer, x, y, z, centerChunkX, centerChunkZ, _isTopBlock, curBlock, upBlock);
                                        }
                                    }
                                }
                            }
                        }

                        if (smallRangeIsNull)
                        {
                            break;
                        }
                    }
                }
            }
        }
    }

    // 判断是否可以挖开这个方块
    protected boolean func_175793_a(IBlockState curBlock, IBlockState upBlock)
    {
        return curBlock.getBlock() == Blocks.stone ? true :
               (curBlock.getBlock() == Blocks.dirt ? true :
               (curBlock.getBlock() == Blocks.grass ? true :
               (curBlock.getBlock() == Blocks.hardened_clay ? true :
               (curBlock.getBlock() == Blocks.stained_hardened_clay ? true :
               (curBlock.getBlock() == Blocks.sandstone ? true :
               (curBlock.getBlock() == Blocks.red_sandstone ? true :
               (curBlock.getBlock() == Blocks.mycelium ? true :
               (curBlock.getBlock() == Blocks.snow_layer ? true :
                   (      curBlock.getBlock() == Blocks.sand
                       || curBlock.getBlock() == Blocks.gravel)
                   && upBlock.getBlock().getMaterial() != Material.water
               ))))))));
    }

    /**
     * Recursively called by generate()
     */
    protected void recursiveGenerate(World worldIn, int chunkX, int chunkZ, int centerChunkX, int centerChunkZ, ChunkPrimer chunkPrimerIn)
    {
        // 之前根据chunkXZ设置种子了

        int seedPointCount = this.rand.nextInt(this.rand.nextInt(this.rand.nextInt(15) + 1) + 1);

        // 1/7概率不生成洞穴
        if (this.rand.nextInt(7) != 0)
        {
            seedPointCount = 0;
        }

        for (int i = 0; i < seedPointCount; ++i)
        {
            // 在chunk内y=8~127随机选种子点
            double seedPointX = (double)(chunkX * 16 + this.rand.nextInt(16));
            double seedPointX = (double)this.rand.nextInt(this.rand.nextInt(120) + 8);
            double seedPointZ = (double)(chunkZ * 16 + this.rand.nextInt(16));
            int directionCount = 1;

            if (this.rand.nextInt(4) == 0)
            {
                // 挖洞，默认参数
                this.func_180703_a(this.rand.nextLong(), centerChunkX, centerChunkZ, chunkPrimerIn, seedPointX, seedPointX, seedPointZ);
                directionCount += this.rand.nextInt(4);
            }

            // 向几个方向挖洞
            for (int j = 0; j < directionCount; ++j)
            {
                float yawAngle   = this.rand.nextFloat() * (float)Math.PI * 2.0F;
                float pitchAngle = (this.rand.nextFloat() - 0.5F) * 2.0F / 8.0F;
                float rangeScale = this.rand.nextFloat() * 2.0F + this.rand.nextFloat();

                if (this.rand.nextInt(10) == 0)
                {
                    // 扩大到1~3倍
                    rangeScale *= this.rand.nextFloat() * this.rand.nextFloat() * 3.0F + 1.0F;
                }

                this.func_180702_a(this.rand.nextLong(), centerChunkX, centerChunkZ, chunkPrimerIn, seedPointX, seedPointX, seedPointZ, rangeScale, yawAngle, pitchAngle, 0, 0, 1.0D);
            }
        }
    }

    protected boolean isOceanBlock(ChunkPrimer data, int x, int y, int z, int chunkX, int chunkZ)
    {
        net.minecraft.block.Block block = data.getBlockState(x, y, z).getBlock();
        return block== Blocks.flowing_water || block == Blocks.water;
    }

    //Exception biomes to make sure we generate like vanilla
    private boolean isExceptionBiome(net.minecraft.world.biome.BiomeGenBase biome)
    {
        if (biome == net.minecraft.world.biome.BiomeGenBase.beach) return true;
        if (biome == net.minecraft.world.biome.BiomeGenBase.desert) return true;
        return false;
    }

    //Determine if the block at the specified location is the top block for the biome, we take into account
    //Vanilla bugs to make sure that we generate the map the same way vanilla does.
    private boolean isTopBlock(ChunkPrimer data, int x, int y, int z, int chunkX, int chunkZ)
    {
        net.minecraft.world.biome.BiomeGenBase biome = worldObj.getBiomeGenForCoords(new BlockPos(x + chunkX * 16, 0, z + chunkZ * 16));
        IBlockState state = data.getBlockState(x, y, z);
        return (isExceptionBiome(biome) ? state.getBlock() == Blocks.grass : state.getBlock() == biome.topBlock);
    }

    /**
     * Digs out the current block, default implementation removes stone, filler, and top block
     * Sets the block to lava if y is less then 10, and air other wise.
     * If setting to air, it also checks to see if we've broken the surface and if so
     * tries to make the floor the biome's top block
     *
     * @param data Block data array
     * @param index Pre-calculated index into block data
     * @param x local X position
     * @param y local Y position
     * @param z local Z position
     * @param chunkX Chunk X position
     * @param chunkZ Chunk Y position
     * @param foundTop True if we've encountered the biome's top block. Ideally if we've broken the surface.
     */
    protected void digBlock(ChunkPrimer data, int x, int y, int z, int chunkX, int chunkZ, boolean foundTop, IBlockState state, IBlockState up)
    {
        net.minecraft.world.biome.BiomeGenBase biome = worldObj.getBiomeGenForCoords(new BlockPos(x + chunkX * 16, 0, z + chunkZ * 16));
        IBlockState top = biome.topBlock;
        IBlockState filler = biome.fillerBlock;

        if (   this.func_175793_a(state, up)
            || state.getBlock() == top.getBlock()
            || state.getBlock() == filler.getBlock())
        {
            if (y < 10) // y<10岩浆多应该是这个造成的
            {
                // 设置为岩浆
                data.setBlockState(x, y, z, Blocks.lava.getDefaultState());
            }
            else
            {
                // 设置为空气
                data.setBlockState(x, y, z, Blocks.air.getDefaultState());

                if (up.getBlock() == Blocks.sand)
                {
                    // 如果上面的方块是沙子则替换为沙石
                    data.setBlockState(x, y + 1, z, up.getValue(BlockSand.VARIANT) == BlockSand.EnumType.RED_SAND ? Blocks.red_sandstone.getDefaultState() : Blocks.sandstone.getDefaultState());
                }

                if (foundTop && data.getBlockState(x, y - 1, z).getBlock() == filler.getBlock())
                {
                    // 如果挖开了顶层方块则把下面的方块设置为顶层方块
                    data.setBlockState(x, y - 1, z, top.getBlock().getDefaultState());
                }
            }
        }
    }
}
```

以上内容来自: [CSDN博客](https://blog.csdn.net/xfgryujk/article/details/67638314)