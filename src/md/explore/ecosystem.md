
# 生成生物群系总流程

接着上篇文章我们看到这个函数

```java

类名net.minecraft.world.gen.ChunkProviderGenerate
    /**
     * Will return back a chunk, if it doesn't exist and its not a MP client it will generates all the blocks for the
     * specified chunk from the map seed and chunk seed
     */
    public Chunk provideChunk(int x, int z)
    {
        // 根据区块坐标设置随机种子
        this.rand.setSeed((long)x * 341873128712L + (long)z * 132897987541L);
        // 这个是生成区块时临时储存方块数据的对象，后面会转为Chunk对象
        ChunkPrimer chunkprimer = new ChunkPrimer();
        // 生成基本地形（没有洞穴等建筑）
        this.setBlocksInChunk(x, z, chunkprimer);
        // ...
    }

    public void setBlocksInChunk(int x, int z, ChunkPrimer chunkprimer)
    {
        // 决定生物群系，这里把区块坐标*4-2了，而且结果是10*10的
        this.biomesForGeneration = this.worldObj.getWorldChunkManager().getBiomesForGeneration(this.biomesForGeneration, x * 4 - 2, z * 4 - 2, 10, 10);
        // ...
    }
类名net.minecraft.world.biome.WorldChunkManager
    /**
     * Returns an array of biomes for the location input.
     */
    public BiomeGenBase[] getBiomesForGeneration(BiomeGenBase[] result, int x, int z, int width, int height)
    {
        IntCache.resetIntCache();

        if (result == null || result.length < width * height)
        {
            result = new BiomeGenBase[width * height];
        }

        // 生成生物群系ID
        int[] biomeId = this.genBiomes.getInts(x, z, width, height);

        try
        {
            for (int i = 0; i < width * height; ++i)
            {
                // 把生物群系ID转成BiomeGenBase对象
                result[i] = BiomeGenBase.getBiomeFromBiomeList(biomeId[i], BiomeGenBase.field_180279_ad);
            }

            return result;
        }
        catch (Throwable throwable)
        {
            // ...
        }
    }

    public WorldChunkManager(long seed, WorldType p_i45744_3_, String p_i45744_4_)
    {
        this();
        this.field_180301_f = p_i45744_4_;
        GenLayer[] agenlayer = GenLayer.initializeAllBiomeGenerators(seed, p_i45744_3_, p_i45744_4_);
        agenlayer = getModdedBiomeGenerators(p_i45744_3_, seed, agenlayer);
        // 这里初始化了genBiomes
        this.genBiomes = agenlayer[0];
        this.biomeIndexLayer = agenlayer[1];
    }
```
接下来就非常复杂了，net.minecraft.world.gen.layer这个包里有很多GenLayer，每层都会用上一层的输出生成这一层的输出  
![Alt text](/img/算法1.png "文件1")  
![Alt text](/img/算法2.png "文件2")  
它们的初始化函数如下，最后的genlayerrivermix就是用来生成生物群系的  
```java
类名net.minecraft.world.gen.layer.GenLayer
    public static GenLayer[] initializeAllBiomeGenerators(long worldSeed, WorldType worldType, String settings)
    {
        GenLayer genlayer = new GenLayerIsland(1L);
        genlayer = new GenLayerFuzzyZoom(2000L, genlayer);
        GenLayerAddIsland genlayeraddisland = new GenLayerAddIsland(1L, genlayer);
        GenLayerZoom genlayerzoom = new GenLayerZoom(2001L, genlayeraddisland);
        GenLayerAddIsland genlayeraddisland1 = new GenLayerAddIsland(2L, genlayerzoom);
        genlayeraddisland1 = new GenLayerAddIsland(50L, genlayeraddisland1);
        genlayeraddisland1 = new GenLayerAddIsland(70L, genlayeraddisland1);
        GenLayerRemoveTooMuchOcean genlayerremovetoomuchocean = new GenLayerRemoveTooMuchOcean(2L, genlayeraddisland1);
        GenLayerAddSnow genlayeraddsnow = new GenLayerAddSnow(2L, genlayerremovetoomuchocean);
        GenLayerAddIsland genlayeraddisland2 = new GenLayerAddIsland(3L, genlayeraddsnow);
        GenLayerEdge genlayeredge = new GenLayerEdge(2L, genlayeraddisland2, GenLayerEdge.Mode.COOL_WARM);
        genlayeredge = new GenLayerEdge(2L, genlayeredge, GenLayerEdge.Mode.HEAT_ICE);
        genlayeredge = new GenLayerEdge(3L, genlayeredge, GenLayerEdge.Mode.SPECIAL);
        GenLayerZoom genlayerzoom1 = new GenLayerZoom(2002L, genlayeredge);
        genlayerzoom1 = new GenLayerZoom(2003L, genlayerzoom1);
        GenLayerAddIsland genlayeraddisland3 = new GenLayerAddIsland(4L, genlayerzoom1);
        GenLayerAddMushroomIsland genlayeraddmushroomisland = new GenLayerAddMushroomIsland(5L, genlayeraddisland3);
        GenLayerDeepOcean genlayerdeepocean = new GenLayerDeepOcean(4L, genlayeraddmushroomisland);
        GenLayer genlayer4 = GenLayerZoom.magnify(1000L, genlayerdeepocean, 0);
        ChunkProviderSettings chunkprovidersettings = null;
        int biomeSize = 4;
        int riverSize = biomeSize;

        if (worldType == WorldType.CUSTOMIZED && settings.length() > 0)
        {
            chunkprovidersettings = ChunkProviderSettings.Factory.jsonToFactory(settings).func_177864_b();
            biomeSize = chunkprovidersettings.biomeSize;
            riverSize = chunkprovidersettings.riverSize;
        }

        if (worldType == WorldType.LARGE_BIOMES)
        {
            biomeSize = 6;
        }

        biomeSize = getModdedBiomeSize(worldType, biomeSize);

        GenLayer lvt_8_1_ = GenLayerZoom.magnify(1000L, genlayer4, 0);
        GenLayerRiverInit genlayerriverinit = new GenLayerRiverInit(100L, lvt_8_1_);
        GenLayer lvt_10_1_ = GenLayerZoom.magnify(1000L, genlayerriverinit, 2);
        GenLayer genlayerbiomeedge = worldType.getBiomeLayer(worldSeed, genlayer4, settings);
        GenLayer genlayerhills = new GenLayerHills(1000L, genlayerbiomeedge, lvt_10_1_);
        GenLayer genlayer5 = GenLayerZoom.magnify(1000L, genlayerriverinit, 2);
        genlayer5 = GenLayerZoom.magnify(1000L, genlayer5, riverSize);
        GenLayerRiver genlayerriver = new GenLayerRiver(1L, genlayer5);
        GenLayerSmooth genlayersmooth = new GenLayerSmooth(1000L, genlayerriver);
        genlayerhills = new GenLayerRareBiome(1001L, genlayerhills);

        for (int i = 0; i < biomeSize; ++i)
        {
            genlayerhills = new GenLayerZoom((long)(1000 + i), genlayerhills);

            if (i == 0)
            {
                genlayerhills = new GenLayerAddIsland(3L, genlayerhills);
            }

            if (i == 1 || biomeSize == 1)
            {
                genlayerhills = new GenLayerShore(1000L, genlayerhills);
            }
        }

        GenLayerSmooth genlayersmooth1 = new GenLayerSmooth(1000L, genlayerhills);
        GenLayerRiverMix genlayerrivermix = new GenLayerRiverMix(100L, genlayersmooth1, genlayersmooth);
        GenLayer genlayer3 = new GenLayerVoronoiZoom(10L, genlayerrivermix);
        genlayerrivermix.initWorldGenSeed(worldSeed);
        genlayer3.initWorldGenSeed(worldSeed);
        return new GenLayer[] {genlayerrivermix, genlayer3, genlayerrivermix};
    }
```
