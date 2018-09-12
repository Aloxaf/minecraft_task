# 基本地形

## **生成基本地形**

山脉：

<img src="./img/Mountain_Biome.png" width="100%" alt="山脉">

沙滩：

<img src="./img/Sand_beach_2.png" width="100%" alt="沙滩">

海洋：

<img src="./img/1.8_Biomes_Ocean.png" width="100%" alt="海洋">


MC不是直接生成一个高度图，而是生成一个三维

的“密度数组”，不知道为什么这样做。我猜是为了生成石窟这种地形，但是这样也有可能生成浮空岛

```java
 // 生成只有石头、水、空气的基本地形
    public void setBlocksInChunk(int xChunk, int zChunk, ChunkPrimer chunkprimer)
    {
        // 生成10*10的生物群系数组
        this.biomesForGeneration = this.worldObj.getWorldChunkManager().getBiomesForGeneration(this.biomesForGeneration, xChunk * 4 - 2, zChunk * 4 - 2, 10, 10);
        // 生成field_147434_q这个数组，我认为它代表密度
        // 尺寸5*5*33，索引高位是x，中位是z，低位是y
        this.func_147423_a(xChunk * 4, 0, zChunk * 4);

        // xyzHigh作为field_147434_q索引，要和xyzLow组合才是方块坐标
        for (int xHigh = 0; xHigh < 4; ++xHigh)
        {
            int xIndex   =  xHigh      * 5;
            int xIndex_1 = (xHigh + 1) * 5;

            for (int zHigh = 0; zHigh < 4; ++zHigh)
            {
                int xzIndex =     (xIndex   + zHigh)     * 33;
                int xz_1Index =   (xIndex   + zHigh + 1) * 33;
                int x_1zIndex =   (xIndex_1 + zHigh)     * 33;
                int x_1z_1Index = (xIndex_1 + zHigh + 1) * 33;

                for (int yHigh = 0; yHigh < 32; ++yHigh)
                {
                    // 这些线性插值后得到的density3才是每个方块的密度
                    double density     =  this.field_147434_q[xzIndex     + yHigh];
                    double densityZ1   =  this.field_147434_q[xz_1Index   + yHigh];
                    double densityX1   =  this.field_147434_q[x_1zIndex   + yHigh];
                    double densityX1Z1 =  this.field_147434_q[x_1z_1Index + yHigh];
                    // 步长，后同
                    double densityStep     = (this.field_147434_q[xzIndex     + yHigh + 1] - density) / 8;
                    double densityZ1Step   = (this.field_147434_q[xz_1Index   + yHigh + 1] - densityZ1) / 8;
                    double densityX1Step   = (this.field_147434_q[x_1zIndex   + yHigh + 1] - densityX1) / 8;
                    double densityX1Z1Step = (this.field_147434_q[x_1z_1Index + yHigh + 1] - densityX1Z1) / 8;

                    for (int yLow = 0; yLow < 8; ++yLow)
                    {
                        double density2   = density;
                        double density2Z1 = densityZ1;
                        double density2Step   = (densityX1 - density) / 4;
                        double density2Z1Step = (densityX1Z1 - densityZ1) / 4;

                        for (int xLow = 0; xLow < 4; ++xLow)
                        {
                            double density3 = density2;
                            double density3Step = (density2Z1 - density2) / 4;

                            for (int zLow = 0; zLow < 4; ++zLow)
                            {
                                if (density3 > 0.0D) // 密度>0认为是固体
                                {
                                    // 设置为石头
                                    chunkprimer.setBlockState(xHigh * 4 + xLow, yHigh * 8 + yLow, zHigh * 4 + zLow, Blocks.stone.getDefaultState());
                                }
                                else if (yHigh * 8 + yLow < this.settings.seaLevel) // 密度<0且在海平面以下认为是液体
                                {
                                    // 设置为默认液体（水或岩浆）
                                    chunkprimer.setBlockState(xHigh * 4 + xLow, yHigh * 8 + yLow, zHigh * 4 + zLow, this.field_177476_s.getDefaultState());
                                }
                                    // 否则是空气

                                density3 += density3Step;
                            }

                            density2   += density2Step;
                            density2Z1 += density2Z1Step;
                        }

                        density     += densityStep;
                        densityZ1   += densityZ1Step;
                        densityX1   += densityX1Step;
                        densityX1Z1 += densityX1Z1Step;
                    }
                }
            }
        }
    }
```

## **生成密度数组**

这部分应该是最重要的，然而我还是没完全看懂，这里把自己的理解写出来了

应该是最重要的，然而我还是没完全看懂，这里把自己的理解写出来了

```java
    // 生成field_147434_q数组（密度数组），areaXZ为区块坐标*4，areaY恒为0
    private void func_147423_a(int areaX, int areaY, int areaZ)
    {
        // 生成5*5*1的噪声
        this.field_147426_g = this.noiseGen6.generateNoiseOctaves(this.field_147426_g, areaX, areaZ, 5, 5, (double)this.settings.depthNoiseScaleX, (double)this.settings.depthNoiseScaleZ, (double)this.settings.depthNoiseScaleExponent);

        float coordinateScale = this.settings.coordinateScale;
        float heightScale = this.settings.heightScale;
        // 生成3个5*5*33的噪声
        this.field_147427_d = this.field_147429_l.generateNoiseOctaves(this.field_147427_d, areaX, areaY, areaZ, 5, 33, 5, (double)(coordinateScale / this.settings.mainNoiseScaleX), (double)(heightScale / this.settings.mainNoiseScaleY), (double)(coordinateScale / this.settings.mainNoiseScaleZ));
        this.field_147428_e = this.field_147431_j.generateNoiseOctaves(this.field_147428_e, areaX, areaY, areaZ, 5, 33, 5, (double)coordinateScale, (double)heightScale, (double)coordinateScale);
        this.field_147425_f = this.field_147432_k.generateNoiseOctaves(this.field_147425_f, areaX, areaY, areaZ, 5, 33, 5, (double)coordinateScale, (double)heightScale, (double)coordinateScale);

        int index = 0;
        int xzIndex = 0;

        for (int x1 = 0; x1 < 5; ++x1)
        {
            for (int z1 = 0; z1 < 5; ++z1)
            {
                float scale = 0.0F;
                float groundYOffset = 0.0F;
                float totalWeight = 0.0F;
                // 中心点生物群系
                BiomeGenBase centerBiome = this.biomesForGeneration[x1 + 2 + (z1 + 2) * 10];

                // 求scale和groundYOffset的加权平均值

                for (int x2 = 0; x2 < 5; ++x2)
                {
                    for (int z2 = 0; z2 < 5; ++z2)
                    {
                        BiomeGenBase biome = this.biomesForGeneration[x1 + x2 + (z1 + z2) * 10];
                        float curGroundYOffset = this.settings.biomeDepthOffSet + biome.minHeight * this.settings.biomeDepthWeight; // biomeDepthOffSet=0
                        // maxHeight是反混淆错误吧，应该是scale
                        float curScale = this.settings.biomeScaleOffset + biome.maxHeight * this.settings.biomeScaleWeight; // biomeScaleOffset=0

                        // 世界类型是巨型生物群系
                        if (this.field_177475_o == WorldType.AMPLIFIED && curGroundYOffset > 0.0F)
                        {
                            curGroundYOffset = 1.0F + curGroundYOffset * 2.0F;
                            curScale = 1.0F + curScale * 4.0F;
                        }

                        // parabolicField为 10 / √(该点到中心点的距离^2 + 0.2)
                        float weight = this.parabolicField[x2 + z2 * 5] / (curGroundYOffset + 2.0F);

                        if (biome.minHeight > centerBiome.minHeight)
                        {
                            weight /= 2.0F;
                        }

                        scale += curScale * weight;
                        groundYOffset += curGroundYOffset * weight;
                        totalWeight += weight;
                    }
                }

                scale = scale / totalWeight;
                groundYOffset = groundYOffset / totalWeight;
                scale = scale * 0.9F + 0.1F;
                groundYOffset = (groundYOffset * 4.0F - 1.0F) / 8.0F;

                // 这部分大概是取一个-0.36~0.125的随机数，这个随机数决定了起伏的地表

                double random = this.field_147426_g[xzIndex] / 8000.0D;

                if (random < 0.0D)
                {
                    random = -random * 0.3D;
                }

                random = random * 3.0D - 2.0D;

                if (random < 0.0D)
                {
                    random = random / 2.0D;

                    if (random < -1.0D)
                    {
                        random = -1.0D;
                    }

                    random = random / 1.4D;
                    random = random / 2.0D;
                }
                else
                {
                    if (random > 1.0D)
                    {
                        random = 1.0D;
                    }

                    random = random / 8.0D;
                }

                double _groundYOffset = (double)groundYOffset;
                double _scale = (double)scale;
                // groundYOffset有-0.072~0.025的变动量
                _groundYOffset = _groundYOffset + random * 0.2D;
                /*_groundYOffset = _groundYOffset * (double)this.settings.baseSize / 8.0D;
                double groundY = (double)this.settings.baseSize + _groundYOffset * 4.0D;*/
                // 这个是大概的地面y坐标，实际上也没有保证不会出现浮空岛...
                double groundY = (double)this.settings.baseSize * (1.0D + _groundYOffset / 2.0D); // baseSize=8.5，应该代表了平均地表高度68

                for (int y = 0; y < 33; ++y) // 注意这个y*8才是最终的y坐标
                {
                    // result偏移量，这个是负数则趋向固体，是正数则趋向液体和空气
                    double offset = ((double)y - groundY) * (double)this.settings.stretchY * 128.0D / 256.0D / _scale; // scale大概在0.1~0.2这样...

                    if (offset < 0.0D)
                    {
                        offset *= 4.0D;
                    }

                    // 并不保证lowerLimit < upperLimit，不过没有影响
                    double lowerLimit = this.field_147428_e[index] / (double)this.settings.lowerLimitScale; // lowerLimitScale=512
                    double upperLimit = this.field_147425_f[index] / (double)this.settings.upperLimitScale; // upperLimitScale=512
                    double t = (this.field_147427_d[index] / 10.0D + 1.0D) / 2.0D;
                    // 这个函数t < 0则取lowerLimit，t > 1则取upperLimit，否则以t为参数在上下限间线性插值
                    double result = MathHelper.denormalizeClamp(lowerLimit, upperLimit, t) - offset;

                    if (y > 29) // y = 30~32
                    {
                        // 在原result和-10之间线性插值，这样y > 240的方块就会越来越少，最后全变成空气
                        double t2 = (double)((float)(y - 29) / 3.0F);
                        result = result * (1.0D - t2) + -10.0D * t2;
                    }

                    this.field_147434_q[index] = result;
                    ++index;
                }

                ++xzIndex;
            }
        }
    }

```



## 生成生物群系相应的方块

### 成品

高寒生物群系

<img src="./img/800px-Extreme_Hills_M.png" width="100%" alt="高寒">

积雪生物群系：

<img src="./img/800px-IcePlains.png" width="100%" alt="雪原">

茂盛生物群系：

<img src="./img/2012-01-04_19.47.47.png" width="100%" alt="平原">

### GenLayerVoronoiZoom

Voronoi图是用来划分平面的，使得每个区域内的点到它所在区域的种子点的距离比到其它区域种子点的距离近

它的上一层是GenLayerRiverMix，之前用它生成了10*10的生物群系ID，这里就要扩展成16*16的

```java

    public int[] getInts(int areaX, int areaY, int areaWidth, int areaHeight)
    {
        areaX = areaX - 2;
        areaY = areaY - 2;
        int parentAreaX = areaX >> 2;
        int parentAreaY = areaY >> 2;
        int parentWidth = (areaWidth >> 2) + 2;
        int parentHeight = (areaHeight >> 2) + 2;
        // parentRes是本层的1/4
        int[] parentRes = this.parent.getInts(parentAreaX, parentAreaY, parentWidth, parentHeight);
        int tmpWidth = parentWidth - 1 << 2;
        int tmpHeight = parentHeight - 1 << 2;
        // 临时结果
        int[] tmp = IntCache.getIntCache(tmpWidth * tmpHeight);

        for (int parentY = 0; parentY < parentHeight - 1; ++parentY)
        {
            // parent当前点的值
            int parentValue   = parentRes[parentY * parentWidth];
            // parent当前点y+1点的值
            int parentValueY1 = parentRes[(parentY + 1) * parentWidth];

            for (int parentX = 0; parentX < parentWidth - 1; ++parentX)
            {
                // 随机取parent的4个点的坐标
                this.initChunkSeed((parentX + parentAreaX) << 2, (parentY + parentAreaY) << 2);
                double vertex1X = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D;
                double vertex1Y = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D;
                this.initChunkSeed((parentX + parentAreaX + 1) << 2, (parentY + parentAreaY) << 2);
                double vertex2X = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D + 4.0D;
                double vertex2Y = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D;
                this.initChunkSeed((parentX + parentAreaX) << 2, (parentY + parentAreaY + 1) << 2);
                double vertex3X = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D;
                double vertex3Y = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D + 4.0D;
                this.initChunkSeed((parentX + parentAreaX + 1) << 2, (parentY + parentAreaY + 1) << 2);
                double vertex4X = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D + 4.0D;
                double vertex4Y = ((double)this.nextInt(1024) / 1024.0D - 0.5D) * 3.6D + 4.0D;

                int parentValueX1   = parentRes[parentX + 1 +  parentY      * parentWidth] % 256;
                int parentValueX1Y1 = parentRes[parentX + 1 + (parentY + 1) * parentWidth] % 256;

                for (int yLow = 0; yLow < 4; ++yLow)
                {
                    int tmpIndex = ((parentY << 2) + yLow) * tmpWidth + (parentX << 2);

                    for (int xLow = 0; xLow < 4; ++xLow)
                    {
                        // 当前点到parent各点的距离的平方
                        double dist1 = ((double)yLow - vertex1Y) * ((double)yLow - vertex1Y) + ((double)xLow - vertex1X) * ((double)xLow - vertex1X);
                        double dist2 = ((double)yLow - vertex2Y) * ((double)yLow - vertex2Y) + ((double)xLow - vertex2X) * ((double)xLow - vertex2X);
                        double dist3 = ((double)yLow - vertex3Y) * ((double)yLow - vertex3Y) + ((double)xLow - vertex3X) * ((double)xLow - vertex3X);
                        double dist4 = ((double)yLow - vertex4Y) * ((double)yLow - vertex4Y) + ((double)xLow - vertex4X) * ((double)xLow - vertex4X);

                        // 取最近点的值
                        if (dist1 < dist2 && dist1 < dist3 && dist1 < dist4)
                        {
                            tmp[tmpIndex++] = parentValue;
                        }
                        else if (dist2 < dist1 && dist2 < dist3 && dist2 < dist4)
                        {
                            tmp[tmpIndex++] = parentValueX1;
                        }
                        else if (dist3 < dist1 && dist3 < dist2 && dist3 < dist4)
                        {
                            tmp[tmpIndex++] = parentValueY1;
                        }
                        else
                        {
                            tmp[tmpIndex++] = parentValueX1Y1;
                        }
                    }
                }

                // parent当前点移动x+1
                parentValue = parentValueX1;
                parentValueY1 = parentValueX1Y1;
            }
        }

        int[] result = IntCache.getIntCache(areaWidth * areaHeight);

        // tmp和result尺寸可能不同，这里把tmp左上角部分复制到result
        for (int resultY = 0; resultY < areaHeight; ++resultY)
        {
            System.arraycopy(tmp, (resultY + areaY % 2) * tmpWidth + (areaX % 2), result, resultY * areaWidth, areaWidth);
        }

        return result;
    }
```

### 替换方块

```java

    public void replaceBlocksForBiome(int chunkX, int chunkZ, ChunkPrimer chunkprimer, BiomeGenBase[] biomes)
    {
        net.minecraftforge.event.terraingen.ChunkProviderEvent.ReplaceBiomeBlocks event = new net.minecraftforge.event.terraingen.ChunkProviderEvent.ReplaceBiomeBlocks(this, chunkX, chunkZ, chunkprimer, this.worldObj);
        net.minecraftforge.common.MinecraftForge.EVENT_BUS.post(event);
        if (event.getResult() == net.minecraftforge.fml.common.eventhandler.Event.Result.DENY) return;

        double coordinateScale = 0.03125D;
        // 生成16*16的噪声
        this.stoneNoise = this.field_147430_m.func_151599_a(this.stoneNoise, (double)(chunkX * 16), (double)(chunkZ * 16), 16, 16, coordinateScale * 2.0D, coordinateScale * 2.0D, 1.0D);

        for (int x = 0; x < 16; ++x)
        {
            for (int z = 0; z < 16; ++z)
            {
                BiomeGenBase biomegenbase = biomes[z + x * 16];
                biomegenbase.genTerrainBlocks(this.worldObj, this.rand, chunkprimer, chunkX * 16 + x, chunkZ * 16 + z, this.stoneNoise[z + x * 16]);
            }
        }
    }
```

类名`net.minecraft.world.biome.BiomeGenBase`

```java

    public void genTerrainBlocks(World worldIn, Random rand, ChunkPrimer chunkPrimerIn, int x, int z, double noise)
    {
        this.generateBiomeTerrain(worldIn, rand, chunkPrimerIn, x, z, noise);
    }

    public final void generateBiomeTerrain(World worldIn, Random rand, ChunkPrimer chunkPrimerIn, int x, int z, double noise)
    {
        int seaLevel = worldIn.getSeaLevel();
        IBlockState topBlock = this.topBlock; // 最顶部的方块，比如草方块
        IBlockState fillerBlock = this.fillerBlock; // 顶部以下用来填充的方块，比如泥土
        // 还需要填充几个方块
        int rest = -1;
        // 需要填充的方块数
        int fillerCount = (int)(noise / 3.0D + 3.0D + rand.nextDouble() * 0.25D);
        int xLow = x % 16;
        int zLow = z % 16;
        BlockPos.MutableBlockPos pos = new BlockPos.MutableBlockPos();

        for (int y = 255; y >= 0; --y)
        {
            if (y <= rand.nextInt(5))
            {
                // y <= 5随机替换为基岩
                chunkPrimerIn.setBlockState(zLow, y, xLow, Blocks.bedrock.getDefaultState());
            }
            else
            {
                IBlockState curBlock = chunkPrimerIn.getBlockState(zLow, y, xLow);

                if (curBlock.getBlock().getMaterial() == Material.air) // 还在空气层，不需要填充
                {
                    rest = -1;
                }
                else if (curBlock.getBlock() == Blocks.stone) // 石头层
                {
                    if (rest == -1) // 还没开始填充
                    {
                        // 到这里y应该在石头与空气和水的分界面

                        if (fillerCount <= 0) // 不需要填充
                        {
                            topBlock = null;
                            fillerBlock = Blocks.stone.getDefaultState();
                        }
                        else if (y >= seaLevel - 4 && y <= seaLevel + 1) // 需要填充，且在海平面附近
                        {
                            topBlock = this.topBlock;
                            fillerBlock = this.fillerBlock;
                        } // 其他情况说明在海底，topBlock、fillerBlock不变

                        // 在海平面以下，且不需要填充
                        if (y < seaLevel && (topBlock == null || topBlock.getBlock().getMaterial() == Material.air))
                        {
                            // 根据温度顶部替换为冰或水
                            if (this.getFloatTemperature(pos.set(x, y, z)) < 0.15F)
                            {
                                topBlock = Blocks.ice.getDefaultState();
                            }
                            else
                            {
                                topBlock = Blocks.water.getDefaultState();
                            }
                        }

                        // 开始填充顶部
                        rest = fillerCount;

                        if (y >= seaLevel - 1) // 海平面以上
                        {
                            // 顶部替换为topBlock
                            chunkPrimerIn.setBlockState(zLow, y, xLow, topBlock);
                        }
                        else if (y < seaLevel - 7 - fillerCount) // 海底
                        {
                            topBlock = null;
                            // 接下来使用石头填充
                            fillerBlock = Blocks.stone.getDefaultState();
                            // 顶部替换为砂砾
                            chunkPrimerIn.setBlockState(zLow, y, xLow, Blocks.gravel.getDefaultState());
                        }
                        else // 海平面以下但不是太深的地方
                        {
                            // 没有顶部了，直接替换为fillerBlock
                            chunkPrimerIn.setBlockState(zLow, y, xLow, fillerBlock);
                        }
                    }
                    else if (rest > 0) // 正在填充
                    {
                        --rest;
                        // 替换为fillerBlock
                        chunkPrimerIn.setBlockState(zLow, y, xLow, fillerBlock);

                        // 如果之前填充了沙子则下面还要填充沙岩
                        if (rest == 0 && fillerBlock.getBlock() == Blocks.sand)
                        {
                            rest = rand.nextInt(4) + Math.max(0, y - 63);
                            fillerBlock = fillerBlock.getValue(BlockSand.VARIANT) == BlockSand.EnumType.RED_SAND ? Blocks.red_sandstone.getDefaultState() : Blocks.sandstone.getDefaultState();
                        }
                    } // rest = 0说明填充完毕
                }
            }
        }
    }
```

以上内容来自: [CSDN博客](https://blog.csdn.net/xfgryujk/article/details/65437654)