
javascript:(function() {
    const e = {
        name: "comically_large_spoon",
        descriptionFunction() {
            return `wield a <b style="color: #C0C0C0;">COMICALLY LARGE SPOON</b><br>bonk enemies with absurd damage<br>silliness meter increases bonk power<br><strong>ONLY A SPOONFUL</strong>`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,
        sillinessMeter: 0,
        maxSilliness: 200,
        spoon: undefined,
        bonkCount: 0,
        haveEphemera: false,
        
        fire() {},
        
        do() {
            if (!this.haveEphemera) {
                this.haveEphemera = true;
                simulation.ephemera.push({
                    name: "giant_spoon_display",
                    do() {
                        if (b.guns[b.activeGun] && b.guns[b.activeGun].name === 'comically_large_spoon') {
                            const gun = b.guns[b.activeGun];
                            
                            // Draw silliness bar
                            const barWidth = 250;
                            const barHeight = 30;
                            const x = canvas.width/2 - barWidth/2;
                            const y = 50;
                            
                            ctx.fillStyle = 'rgba(0,0,0,0.8)';
                            ctx.fillRect(x, y, barWidth, barHeight);
                            
                            const gradient = ctx.createLinearGradient(x, y, x + barWidth, y);
                            gradient.addColorStop(0, '#C0C0C0');
                            gradient.addColorStop(0.5, '#FFD700');
                            gradient.addColorStop(1, '#FF1493');
                            
                            ctx.fillStyle = gradient;
                            ctx.fillRect(x, y, barWidth * (gun.sillinessMeter / gun.maxSilliness), barHeight);
                            
                            ctx.strokeStyle = '#FFD700';
                            ctx.lineWidth = 3;
                            ctx.strokeRect(x, y, barWidth, barHeight);
                            
                            ctx.fillStyle = '#FFFFFF';
                            ctx.font = 'bold 16px Comic Sans MS';
                            ctx.textAlign = 'center';
                            ctx.fillText('🥄 SILLINESS 🥄', x + barWidth/2, y + 20);
                        }
                    }
                });
            }
            
            if (input.fire && m.fireCDcycle < m.cycle) {
                if (!this.spoon && b.guns[b.activeGun].name === 'comically_large_spoon') {
                    ({ spoon: this.spoon } = this.createSpoon());
                    this.bonkCount++;
                    this.sillinessMeter = Math.min(this.maxSilliness, this.sillinessMeter + 10);
                    m.fireCDcycle = m.cycle + 20;
                }
            }
            
            if (this.spoon && !input.fire) {
                Composite.remove(engine.world, this.spoon);
                this.spoon.parts.forEach(part => {
                    Composite.remove(engine.world, part);
                    const index = bullet.indexOf(part);
                    if (index !== -1) bullet.splice(index, 1);
                });
                this.spoon = undefined;
            } else if (this.spoon) {
                Matter.Body.setPosition(this.spoon, player.position);
                Matter.Body.setAngularVelocity(this.spoon, Math.PI * 0.15);
                
                // Check bonk
                for (let i = 0; i < mob.length; i++) {
                    if (Matter.Query.collides(this.spoon, [mob[i]]).length > 0) {
                        const bonkMultiplier = 1 + (this.sillinessMeter / this.maxSilliness) * 2;
                        const dmg = (m.damageDone || 1) * 0.25 * bonkMultiplier;
                        mob[i].damage(dmg, true);
                        
                        simulation.inGameConsole(`<span style="color: #FFD700;">🥄 BONK! ${bonkMultiplier.toFixed(1)}x</span>`);
                        
                        simulation.drawList.push({
                            x: mob[i].position.x,
                            y: mob[i].position.y,
                            radius: Math.sqrt(dmg) * 60,
                            color: "rgba(255, 215, 0, 0.8)",
                            time: simulation.drawTime
                        });
                        
                        // Knockback
                        const angle = Math.atan2(mob[i].position.y - m.pos.y, mob[i].position.x - m.pos.x);
                        Matter.Body.setVelocity(mob[i], {
                            x: mob[i].velocity.x + Math.cos(angle) * 20 * bonkMultiplier,
                            y: mob[i].velocity.y + Math.sin(angle) * 20 * bonkMultiplier
                        });
                        break;
                    }
                }
                
                this.renderSpoon();
            }
        },
        
        createSpoon() {
            const x = m.pos.x;
            const y = m.pos.y;
            
            // Giant bowl of spoon (oval)
            const bowlWidth = 150;
            const bowlHeight = 200;
            const bowl = Bodies.circle(x, y - 250, bowlWidth/2, spawn.propsIsNotHoldable);
            Matter.Body.scale(bowl, 1, bowlHeight/bowlWidth);
            
            // Long handle
            const handleLength = 400;
            const handleWidth = 30;
            const handle = Bodies.rectangle(x, y + handleLength/2 - 50, handleWidth, handleLength, spawn.propsIsNotHoldable);
            
            const spoon = Body.create({
                parts: [bowl, handle]
            });
            
            Composite.add(engine.world, spoon);
            Matter.Body.setAngle(spoon, -m.angle - Math.PI/2);
            
            spoon.collisionFilter.category = cat.bullet;
            spoon.collisionFilter.mask = cat.mob;
            
            return { spoon };
        },
        
        renderSpoon() {
            if (!this.spoon) return;
            
            ctx.save();
            
            for (let part of this.spoon.parts) {
                ctx.beginPath();
                ctx.arc(part.position.x, part.position.y, 75, 0, Math.PI * 2);
                
                const gradient = ctx.createRadialGradient(
                    part.position.x, part.position.y, 0,
                    part.position.x, part.position.y, 75
                );
                gradient.addColorStop(0, '#E8E8E8');
                gradient.addColorStop(1, '#C0C0C0');
                
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.strokeStyle = '#A8A8A8';
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            
            // Silly sparkles
            if (this.sillinessMeter > 100) {
                for (let i = 0; i < 5; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 100 + Math.random() * 50;
                    ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 70%)`;
                    ctx.beginPath();
                    ctx.arc(
                        this.spoon.position.x + Math.cos(angle) * dist,
                        this.spoon.position.y + Math.sin(angle) * dist,
                        5, 0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
            
            ctx.restore();
        }
    };
    
    b.guns.push(e);
    const gunArray = b.guns.filter((obj, index, self) => 
        index === self.findIndex((item) => item.name === obj.name)
    );
    b.guns = gunArray;
    
    console.log("%cCOMICALLY LARGE SPOON weapon successfully installed", "color: #C0C0C0; font-weight: bold; font-size: 16px;");
})();
