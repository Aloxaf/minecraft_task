# Minecraft中的世界生成

## 世界设置

首先从创建世界的GUI开始看，类名net.minecraft.client.gui.GuiCreateWorld，以下是点击按钮的代码和界面  

![主界面](./img/timg.jpg "主界面")

类名net.minecraft.client.Minecraft

```java
    /**
     * Arguments: World foldername,  World ingame name, WorldSettings
     */
    public void launchIntegratedServer(String folderName, String worldName, WorldSettings worldSettingsIn)
    {
        net.minecraftforge.fml.client.FMLClientHandler.instance().startIntegratedServer(folderName, worldName, worldSettingsIn);
        // 首先卸载已经加载的世界
        this.loadWorld((WorldClient)null);
        System.gc();
        ISaveHandler isavehandler = this.saveLoader.getSaveLoader(folderName, false);
        // 世界信息，包含世界名、难度、时间、出生点等东西
        WorldInfo worldinfo = isavehandler.loadWorldInfo();

        // 因为是创造新的世界，这里worldinfo == null
        if (worldinfo == null && worldSettingsIn != null)
        {
            worldinfo = new WorldInfo(worldSettingsIn, folderName);
            isavehandler.saveWorldInfo(worldinfo);
        }

        if (worldSettingsIn == null)
        {
            worldSettingsIn = new WorldSettings(worldinfo);
        }

        try
        {
            // 启动游戏服务器线程
            this.theIntegratedServer = new IntegratedServer(this, folderName, worldName, worldSettingsIn);
            this.theIntegratedServer.startServerThread();
            this.integratedServerIsRunning = true;
        }
        catch (Throwable throwable)
        {
            CrashReport crashreport = CrashReport.makeCrashReport(throwable, "Starting integrated server");
            CrashReportCategory crashreportcategory = crashreport.makeCategory("Starting integrated server");
            crashreportcategory.addCrashSection("Level ID", folderName);
            crashreportcategory.addCrashSection("Level Name", worldName);
            throw new ReportedException(crashreport);
        }

        this.loadingScreen.displaySavingString(I18n.format("menu.loadingLevel", new Object[0]));

        // 轮询获取加载世界的进度并显示
        while (!this.theIntegratedServer.serverIsInRunLoop())
        {
            if (!net.minecraftforge.fml.common.StartupQuery.check())
            {
                loadWorld(null);
                displayGuiScreen(null);
                return;
            }
            String s = this.theIntegratedServer.getUserMessage();

            if (s != null)
            {
                this.loadingScreen.displayLoadingString(I18n.format(s, new Object[0]));
            }
            else
            {
                this.loadingScreen.displayLoadingString("");
            }

            try
            {
                Thread.sleep(200L);
            }
            catch (InterruptedException var9)
            {
                ;
            }
        }

        // 以下是客户端与服务器连接，这里不讨论
        this.displayGuiScreen((GuiScreen)null);
        SocketAddress socketaddress = this.theIntegratedServer.getNetworkSystem().addLocalEndpoint();
        NetworkManager networkmanager = NetworkManager.provideLocalClient(socketaddress);
        networkmanager.setNetHandler(new NetHandlerLoginClient(networkmanager, this, (GuiScreen)null));
        networkmanager.sendPacket(new C00Handshake(47, socketaddress.toString(), 0, EnumConnectionState.LOGIN, true));
        com.mojang.authlib.GameProfile gameProfile = this.getSession().getProfile();
        if (!this.getSession().hasCachedProperties())
        {
            gameProfile = sessionService.fillProfileProperties(gameProfile, true); //Forge: Fill profile properties upon game load. Fixes MC-52974.
            this.getSession().setProperties(gameProfile.getProperties());
        }
        networkmanager.sendPacket(new C00PacketLoginStart(gameProfile));
        this.myNetworkManager = networkmanager;
    }
```
## 启动游戏服务器
这里补充一些小知识，MC的单人游戏其实是在本进程内建了服务器，服务器才是负责生成世界的，客户端只负责操作输入、渲染等  
类名net.minecraft.client.Minecraft  
```
    /**
     * Arguments: World foldername,  World ingame name, WorldSettings
     */
    public void launchIntegratedServer(String folderName, String worldName, WorldSettings worldSettingsIn)
    {
        net.minecraftforge.fml.client.FMLClientHandler.instance().startIntegratedServer(folderName, worldName, worldSettingsIn);
        // 首先卸载已经加载的世界
        this.loadWorld((WorldClient)null);
        System.gc();
        ISaveHandler isavehandler = this.saveLoader.getSaveLoader(folderName, false);
        // 世界信息，包含世界名、难度、时间、出生点等东西
        WorldInfo worldinfo = isavehandler.loadWorldInfo();

        // 因为是创造新的世界，这里worldinfo == null
        if (worldinfo == null && worldSettingsIn != null)
        {
            worldinfo = new WorldInfo(worldSettingsIn, folderName);
            isavehandler.saveWorldInfo(worldinfo);
        }

        if (worldSettingsIn == null)
        {
            worldSettingsIn = new WorldSettings(worldinfo);
        }

        try
        {
            // 启动游戏服务器线程
            this.theIntegratedServer = new IntegratedServer(this, folderName, worldName, worldSettingsIn);
            this.theIntegratedServer.startServerThread();
            this.integratedServerIsRunning = true;
        }
        catch (Throwable throwable)
        {
            CrashReport crashreport = CrashReport.makeCrashReport(throwable, "Starting integrated server");
            CrashReportCategory crashreportcategory = crashreport.makeCategory("Starting integrated server");
            crashreportcategory.addCrashSection("Level ID", folderName);
            crashreportcategory.addCrashSection("Level Name", worldName);
            throw new ReportedException(crashreport);
        }

        this.loadingScreen.displaySavingString(I18n.format("menu.loadingLevel", new Object[0]));

        // 轮询获取加载世界的进度并显示
        while (!this.theIntegratedServer.serverIsInRunLoop())
        {
            if (!net.minecraftforge.fml.common.StartupQuery.check())
            {
                loadWorld(null);
                displayGuiScreen(null);
                return;
            }
            String s = this.theIntegratedServer.getUserMessage();

            if (s != null)
            {
                this.loadingScreen.displayLoadingString(I18n.format(s, new Object[0]));
            }
            else
            {
                this.loadingScreen.displayLoadingString("");
            }

            try
            {
                Thread.sleep(200L);
            }
            catch (InterruptedException var9)
            {
                ;
            }
        }

        // 以下是客户端与服务器连接，这里不讨论
        this.displayGuiScreen((GuiScreen)null);
        SocketAddress socketaddress = this.theIntegratedServer.getNetworkSystem().addLocalEndpoint();
        NetworkManager networkmanager = NetworkManager.provideLocalClient(socketaddress);
        networkmanager.setNetHandler(new NetHandlerLoginClient(networkmanager, this, (GuiScreen)null));
        networkmanager.sendPacket(new C00Handshake(47, socketaddress.toString(), 0, EnumConnectionState.LOGIN, true));
        com.mojang.authlib.GameProfile gameProfile = this.getSession().getProfile();
        if (!this.getSession().hasCachedProperties())
        {
            gameProfile = sessionService.fillProfileProperties(gameProfile, true); //Forge: Fill profile properties upon game load. Fixes MC-52974.
            this.getSession().setProperties(gameProfile.getProperties());
        }
        networkmanager.sendPacket(new C00PacketLoginStart(gameProfile));
        this.myNetworkManager = networkmanager;
    }
```
## 加载世界

![流程](./img/flow_chart2.png "流程")

类名net.minecraft.server.integrated.IntegratedServer  
服务器线程启动后调用这个函数
```
    /**
     * Initialises the server and starts it.
     */
    protected boolean startServer() throws IOException
    {
        logger.info("Starting integrated minecraft server version 1.8.9");
        this.setOnlineMode(true);
        this.setCanSpawnAnimals(true);
        this.setCanSpawnNPCs(true);
        this.setAllowPvp(true);
        this.setAllowFlight(true);
        logger.info("Generating keypair");
        this.setKeyPair(CryptManager.generateKeyPair());
        if (!net.minecraftforge.fml.common.FMLCommonHandler.instance().handleServerAboutToStart(this)) return false;
        // 加载所有世界（主世界、地狱、末地等）
        this.loadAllWorlds(this.getFolderName(), this.getWorldName(), this.theWorldSettings.getSeed(), this.theWorldSettings.getTerrainType(), this.theWorldSettings.getWorldName());
        this.setMOTD(this.getServerOwner() + " - " + this.worldServers[0].getWorldInfo().getWorldName());
        return net.minecraftforge.fml.common.FMLCommonHandler.instance().handleServerStarting(this);
    }


    protected void loadAllWorlds(String folderName, String worldName, long seed, WorldType type, String p_71247_6_)
    {
        this.convertMapIfNeeded(folderName);
        ISaveHandler isavehandler = this.getActiveAnvilConverter().getSaveLoader(folderName, true);
        this.setResourcePackFromWorld(this.getFolderName(), isavehandler);
        WorldInfo worldinfo = isavehandler.loadWorldInfo();

        if (worldinfo == null)
        {
            worldinfo = new WorldInfo(this.theWorldSettings, worldName);
        }
        else
        {
            worldinfo.setWorldName(worldName);
        }

        WorldServer overWorld = (isDemo() ? (WorldServer)(new DemoWorldServer(this, isavehandler, worldinfo, 0, this.theProfiler)).init() :
                                            (WorldServer)(new WorldServer(this, isavehandler, worldinfo, 0, this.theProfiler)).init());
        overWorld.initialize(this.theWorldSettings);

        // 初始化各世界
        for (int dim : net.minecraftforge.common.DimensionManager.getStaticDimensionIDs())
        {
            WorldServer world = (dim == 0 ? overWorld : (WorldServer)(new WorldServerMulti(this, isavehandler, dim, overWorld, this.theProfiler)).init());
            world.addWorldAccess(new WorldManager(this, world));
            if (!this.isSinglePlayer())
            {
                world.getWorldInfo().setGameType(getGameType());
            }
            net.minecraftforge.common.MinecraftForge.EVENT_BUS.post(new net.minecraftforge.event.world.WorldEvent.Load(world));
        }

        this.getConfigurationManager().setPlayerManager(new WorldServer[]{ overWorld });

        if (overWorld.getWorldInfo().getDifficulty() == null)
        {
            this.setDifficultyForAllWorlds(this.mc.gameSettings.difficulty);
        }

        // 加载玩家附近的区块
        this.initialWorldChunkLoad();
    }



```

类名net.minecraft.server.MinecraftServer

```java
    protected void initialWorldChunkLoad()
    {
        int i = 16;
        int j = 4;
        int k = 192;
        int l = 625;
        int i1 = 0;
        this.setUserMessage("menu.generatingTerrain");
        int j1 = 0;
        logger.info("Preparing start region for level " + j1);
        WorldServer worldserver = net.minecraftforge.common.DimensionManager.getWorld(j1);
        BlockPos blockpos = worldserver.getSpawnPoint();
        long k1 = getCurrentTimeMillis();

        // MC中区块大小是16*16，所以这里是加载玩家附近25*25个区块
        for (int l1 = -192; l1 <= 192 && this.isServerRunning(); l1 += 16)
        {
            for (int i2 = -192; i2 <= 192 && this.isServerRunning(); i2 += 16)
            {
                long j2 = getCurrentTimeMillis();

                if (j2 - k1 > 1000L)
                {
                    this.outputPercentRemaining("Preparing spawn area", i1 * 100 / 625);
                    k1 = j2;
                }

                ++i1;
                // 加载一个区块，参数是区块坐标（方块坐标/16）
                worldserver.theChunkProviderServer.loadChunk(blockpos.getX() + l1 >> 4, blockpos.getZ() + i2 >> 4);
            }
        }

        this.clearCurrentTask();
    }

```

类名net.minecraft.world.gen.ChunkProviderServeri

```java

    /**
     * loads or generates the chunk at the chunk location specified
     */
    public Chunk loadChunk(int p_73158_1_, int p_73158_2_)
    {
        return loadChunk(p_73158_1_, p_73158_2_, null);
    }

    public Chunk loadChunk(int par1, int par2, Runnable runnable)
    {
        long k = ChunkCoordIntPair.chunkXZ2Int(par1, par2);
        this.droppedChunksSet.remove(Long.valueOf(k));
        Chunk chunk = (Chunk)this.id2ChunkMap.getValueByKey(k);
        net.minecraft.world.chunk.storage.AnvilChunkLoader loader = null;

        if (this.chunkLoader instanceof net.minecraft.world.chunk.storage.AnvilChunkLoader)
        {
            loader = (net.minecraft.world.chunk.storage.AnvilChunkLoader) this.chunkLoader;
        }

        // We can only use the queue for already generated chunks
        if (chunk == null && loader != null && loader.chunkExists(this.worldObj, par1, par2))
        {
            if (runnable != null)
            {
                net.minecraftforge.common.chunkio.ChunkIOExecutor.queueChunkLoad(this.worldObj, loader, this, par1, par2, runnable);
                return null;
            }
            else
            {
                chunk = net.minecraftforge.common.chunkio.ChunkIOExecutor.syncChunkLoad(this.worldObj, loader, this, par1, par2);
            }
        }
        else if (chunk == null)
        {
            // 此时区块还未生成所以会运行到这里
            chunk = this.originalLoadChunk(par1, par2);
        }

        // If we didn't load the chunk async and have a callback run it now
        if (runnable != null)
        {
            runnable.run();
        }

        return chunk;
    }

    public Chunk originalLoadChunk(int p_73158_1_, int p_73158_2_)
    {
        long i = ChunkCoordIntPair.chunkXZ2Int(p_73158_1_, p_73158_2_);
        this.droppedChunksSet.remove(Long.valueOf(i));
        Chunk chunk = (Chunk)this.id2ChunkMap.getValueByKey(i);

        if (chunk == null)
        {
            boolean added = loadingChunks.add(i);
            if (!added)
            {
                net.minecraftforge.fml.common.FMLLog.bigWarning("There is an attempt to load a chunk (%d,%d) in di    >mension %d that is already being loaded. This will cause weird chunk breakages.", p_73158_1_, p_73158_2_, worldObj.provider.getDimensionId());
            }
            chunk = net.minecraftforge.common.ForgeChunkManager.fetchDormantChunk(i, this.worldObj);

            if (chunk == null)
            chunk = this.loadChunkFromFile(p_73158_1_, p_73158_2_);

            if (chunk == null)
            {
                if (this.serverChunkGenerator == null)
                {
                    chunk = this.dummyChunk;
                }
                else
                {
                    try
                    {
                        // 如果区块不存在，这个函数会生成区块
                        chunk = this.serverChunkGenerator.provideChunk(p_73158_1_, p_73158_2_);
                    }
                    catch (Throwable throwable)
                    {
                        CrashReport crashreport = CrashReport.makeCrashReport(throwable, "Exception generating new chunk");
                        CrashReportCategory crashreportcategory = crashreport.makeCategory("Chunk to be generated");
                        crashreportcategory.addCrashSection("Location", String.format("%d,%d", new Object[] {Integer.valueOf(p_73158_1_), Integer.valueOf(p_73158_2_)}));
                        crashreportcategory.addCrashSection("Position hash", Long.valueOf(i));
                        crashreportcategory.addCrashSection("Generator", this.serverChunkGenerator.makeString());
                        throw new ReportedException(crashreport);
                    }
                }
            }

            this.id2ChunkMap.add(i, chunk);
            this.loadedChunks.add(chunk);
            loadingChunks.remove(i);
            chunk.onChunkLoad();
            chunk.populateChunk(this, this, p_73158_1_, p_73158_2_);
        }

        return chunk;
    }

```

以上内容来自: [CSDN博客](https://blog.csdn.net/xfgryujk/article/details/61915888)
