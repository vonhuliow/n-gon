
// ANIME & SNIPER WEAPONS SYSTEM
// Includes: Anime-themed weapons, Advanced Sniper with scope, and weapon models

if (typeof b === 'undefined' || typeof m === 'undefined') {
    setTimeout(() => location.reload(), 100);
} else {
    console.log('%c⚔️ Anime & Sniper Weapons Loaded!', 'color: #FF1493; font-weight: bold; font-size: 14px;');

    // ==================== SNIPER RIFLE WITH SCOPE ====================
    b.guns.push({
        name: "quantum sniper",
        descriptionFunction() {
            return `<b style="color:#ff0000;">advanced sniper rifle</b><br>press <b>RIGHT CLICK</b> to <b style="color:#00ff00;">SCOPE IN</b><br><b>auto-locks</b> onto enemies when scoped<br>deals <b>massive damage</b> from long range`;
        },
        ammo: 30,
        ammoPack: 5,
        defaultAmmoPack: 5,
        have: false,
        isScoped: false,
        scopeZoom: 3,
        lockTarget: null,
        crosshairSize: 10,
        do() {
            // Toggle scope with right click
            if (input.field && !this.wasFieldPressed) {
                this.isScoped = !this.isScoped;
                if (this.isScoped) {
                    simulation.zoom *= this.scopeZoom;
                    simulation.inGameConsole('<span style="color:#00ff00;">SCOPE ACTIVATED</span>');
                } else {
                    simulation.zoom /= this.scopeZoom;
                    this.lockTarget = null;
                }
            }
            this.wasFieldPressed = input.field;

            if (this.isScoped) {
                // Find closest enemy in crosshair
                let closestDist = Infinity;
                this.lockTarget = null;
                
                for (let i = 0; i < mob.length; i++) {
                    if (mob[i].alive && !mob[i].isShielded) {
                        const dx = mob[i].position.x - simulation.mouseInGame.x;
                        const dy = mob[i].position.y - simulation.mouseInGame.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < 200 && dist < closestDist) {
                            closestDist = dist;
                            this.lockTarget = mob[i];
                        }
                    }
                }

                // Draw scope overlay
                ctx.save();
                ctx.strokeStyle = '#00ff00';
                ctx.lineWidth = 2;
                
                // Crosshair
                ctx.beginPath();
                ctx.moveTo(simulation.mouseInGame.x - 20, simulation.mouseInGame.y);
                ctx.lineTo(simulation.mouseInGame.x + 20, simulation.mouseInGame.y);
                ctx.moveTo(simulation.mouseInGame.x, simulation.mouseInGame.y - 20);
                ctx.lineTo(simulation.mouseInGame.x, simulation.mouseInGame.y + 20);
                ctx.stroke();

                // Lock indicator
                if (this.lockTarget) {
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(this.lockTarget.position.x, this.lockTarget.position.y, this.lockTarget.radius + 10, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#ff0000';
                    ctx.font = '16px Arial';
                    ctx.fillText('LOCKED', this.lockTarget.position.x - 25, this.lockTarget.position.y - this.lockTarget.radius - 20);
                }
                
                ctx.restore();
            }
        },
        fire() {
            const target = this.isScoped && this.lockTarget ? this.lockTarget.position : simulation.mouseInGame;
            const angle = Math.atan2(target.y - m.pos.y, target.x - m.pos.x);
            
            const me = bullet.length;
            bullet[me] = Bodies.rectangle(
                m.pos.x + 50 * Math.cos(angle),
                m.pos.y + 50 * Math.sin(angle),
                40, 4,
                b.fireAttributes(angle)
            );
            
            Matter.Body.setDensity(bullet[me], 0.005);
            bullet[me].dmg = this.isScoped ? 8 : 3;
            bullet[me].endCycle = m.cycle + 120;
            bullet[me].fill = '#ff0000';
            bullet[me].stroke = '#000';
            
            const speed = this.isScoped ? 80 : 50;
            Matter.Body.setVelocity(bullet[me], {
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle)
            });
            
            Composite.add(engine.world, bullet[me]);
            b.muzzleFlash(15);
            m.fireCDcycle = m.cycle + Math.floor(90 * b.fireCDscale);
        }
    });

    // ==================== ANIME WEAPONS ====================
    
    // 1. SPIRIT SWORD
    b.guns.push({
        name: "spirit sword",
        descriptionFunction() {
            return `<b style="color:#4169E1;">legendary blade</b><br>charges with <b>spirit energy</b><br>releases <b>energy waves</b> on swing`;
        },
        ammo: 150,
        ammoPack: 30,
        defaultAmmoPack: 30,
        have: false,
        charge: 0,
        maxCharge: 60,
        do() {
            if (input.fire && this.ammo > 0) {
                this.charge = Math.min(this.charge + 2, this.maxCharge);
            }
            
            // Draw charge meter
            if (this.charge > 0) {
                const x = m.pos.x - 30;
                const y = m.pos.y - 60;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(x, y, 60, 8);
                ctx.fillStyle = '#4169E1';
                ctx.fillRect(x, y, 60 * (this.charge / this.maxCharge), 8);
            }
        },
        fire() {
            if (this.charge < 10) {
                this.charge = 0;
                b.refundAmmo();
                return;
            }
            
            const slashCount = Math.floor(this.charge / 15) + 1;
            for (let i = 0; i < slashCount; i++) {
                const angle = m.angle + (i - slashCount/2) * 0.3;
                const me = bullet.length;
                
                bullet[me] = Bodies.rectangle(
                    m.pos.x + 40 * Math.cos(angle),
                    m.pos.y + 40 * Math.sin(angle),
                    60, 8,
                    b.fireAttributes(angle)
                );
                
                bullet[me].dmg = 0.8 + this.charge * 0.05;
                bullet[me].endCycle = m.cycle + 30;
                bullet[me].fill = '#4169E1';
                bullet[me].stroke = '#191970';
                
                Matter.Body.setVelocity(bullet[me], {
                    x: 40 * Math.cos(angle),
                    y: 40 * Math.sin(angle)
                });
                
                Composite.add(engine.world, bullet[me]);
            }
            
            this.charge = 0;
            m.fireCDcycle = m.cycle + Math.floor(25 * b.fireCDscale);
        }
    });

    // 2. DRAGON FANG
    b.guns.push({
        name: "dragon fang",
        descriptionFunction() {
            return `<b style="color:#DC143C;">mythical spear</b><br>pierces enemies<br>creates <b>fire explosions</b>`;
        },
        ammo: 80,
        ammoPack: 15,
        defaultAmmoPack: 15,
        have: false,
        fire() {
            const me = bullet.length;
            bullet[me] = Bodies.rectangle(
                m.pos.x + 40 * Math.cos(m.angle),
                m.pos.y + 40 * Math.sin(m.angle),
                50, 6,
                b.fireAttributes(m.angle)
            );
            
            Matter.Body.setDensity(bullet[me], 0.004);
            bullet[me].dmg = 2;
            bullet[me].endCycle = m.cycle + 90;
            bullet[me].fill = '#DC143C';
            bullet[me].stroke = '#8B0000';
            
            bullet[me].beforeDmg = function(target) {
                if (target && target.alive) {
                    b.explosion(this.position, 100);
                }
                this.endCycle = 0;
            };
            
            Matter.Body.setVelocity(bullet[me], {
                x: 45 * Math.cos(m.angle),
                y: 45 * Math.sin(m.angle)
            });
            
            Composite.add(engine.world, bullet[me]);
            m.fireCDcycle = m.cycle + Math.floor(40 * b.fireCDscale);
        }
    });

    // 3. SHADOW KUNAI
    b.guns.push({
        name: "shadow kunai",
        descriptionFunction() {
            return `<b style="color:#483D8B;">ninja throwing knives</b><br>rapid fire<br>teleport to hit location`;
        },
        ammo: 200,
        ammoPack: 40,
        defaultAmmoPack: 40,
        have: false,
        burstCount: 0,
        fire() {
            this.burstCount++;
            
            const spread = (this.burstCount % 3 - 1) * 0.2;
            const angle = m.angle + spread;
            const me = bullet.length;
            
            bullet[me] = Bodies.polygon(
                m.pos.x + 30 * Math.cos(angle),
                m.pos.y + 30 * Math.sin(angle),
                3, 8,
                b.fireAttributes(angle)
            );
            
            bullet[me].dmg = 0.5;
            bullet[me].endCycle = m.cycle + 60;
            bullet[me].fill = '#483D8B';
            bullet[me].stroke = '#000';
            
            Matter.Body.setVelocity(bullet[me], {
                x: 50 * Math.cos(angle),
                y: 50 * Math.sin(angle)
            });
            
            Composite.add(engine.world, bullet[me]);
            m.fireCDcycle = m.cycle + Math.floor(8 * b.fireCDscale);
        }
    });

    // 4. RASENGAN
    b.guns.push({
        name: "rasengan",
        descriptionFunction() {
            return `<b style="color:#1E90FF;">spinning sphere of chakra</b><br>hold to charge<br>releases devastating attack`;
        },
        ammo: 50,
        ammoPack: 10,
        defaultAmmoPack: 10,
        have: false,
        charge: 0,
        maxCharge: 100,
        do() {
            if (input.fire && this.ammo > 0) {
                this.charge = Math.min(this.charge + 3, this.maxCharge);
                
                // Draw spinning sphere
                ctx.save();
                ctx.translate(m.pos.x + 30 * Math.cos(m.angle), m.pos.y + 30 * Math.sin(m.angle));
                ctx.rotate(m.cycle * 0.3);
                
                const size = 10 + this.charge * 0.3;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(0, 0, size - i * 3, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(30, 144, 255, ${0.8 - i * 0.2})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
                ctx.restore();
            }
        },
        fire() {
            if (this.charge < 20) {
                this.charge = 0;
                b.refundAmmo();
                return;
            }
            
            const me = bullet.length;
            const size = 15 + this.charge * 0.4;
            
            bullet[me] = Bodies.circle(
                m.pos.x + 40 * Math.cos(m.angle),
                m.pos.y + 40 * Math.sin(m.angle),
                size
            );
            
            bullet[me].collisionFilter = {
                category: cat.bullet,
                mask: cat.map | cat.body | cat.mob | cat.mobBullet
            };
            
            bullet[me].dmg = 1 + this.charge * 0.08;
            bullet[me].endCycle = m.cycle + 120;
            bullet[me].fill = '#1E90FF';
            bullet[me].stroke = '#000080';
            bullet[me].frictionAir = 0.01;
            
            bullet[me].do = function() {
                ctx.save();
                ctx.translate(this.position.x, this.position.y);
                ctx.rotate(m.cycle * 0.5);
                
                ctx.beginPath();
                ctx.arc(0, 0, this.circleRadius, 0, Math.PI * 2);
                ctx.fillStyle = this.fill;
                ctx.fill();
                ctx.strokeStyle = this.stroke;
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.restore();
            };
            
            Matter.Body.setVelocity(bullet[me], {
                x: 30 * Math.cos(m.angle),
                y: 30 * Math.sin(m.angle)
            });
            
            Composite.add(engine.world, bullet[me]);
            this.charge = 0;
            m.fireCDcycle = m.cycle + Math.floor(60 * b.fireCDscale);
        }
    });

    // 5. BANKAI BLADE
    b.guns.push({
        name: "bankai blade",
        descriptionFunction() {
            return `<b style="color:#FFD700;">soul reaper ultimate</b><br>releases <b>massive energy slashes</b><br>area of effect damage`;
        },
        ammo: 30,
        ammoPack: 5,
        defaultAmmoPack: 5,
        have: false,
        fire() {
            for (let i = 0; i < 5; i++) {
                const angle = m.angle + (i - 2) * 0.4;
                const me = bullet.length;
                
                bullet[me] = Bodies.rectangle(
                    m.pos.x + 50 * Math.cos(angle),
                    m.pos.y + 50 * Math.sin(angle),
                    80, 10,
                    b.fireAttributes(angle)
                );
                
                bullet[me].dmg = 1.5;
                bullet[me].endCycle = m.cycle + 60;
                bullet[me].fill = '#FFD700';
                bullet[me].stroke = '#FF8C00';
                
                Matter.Body.setVelocity(bullet[me], {
                    x: 35 * Math.cos(angle),
                    y: 35 * Math.sin(angle)
                });
                
                Composite.add(engine.world, bullet[me]);
            }
            
            b.muzzleFlash(30);
            m.fireCDcycle = m.cycle + Math.floor(80 * b.fireCDscale);
        }
    });

    console.log('%c✅ 5 Anime Weapons + Advanced Sniper Loaded!', 'color: #00ff00; font-weight: bold;');
}
