// Photonic Crystal Weapons - 6 Anime-Styled Light-Based Weapons
// Requires: photonic crystal tech

(function() {
    'use strict';

    if (typeof b === 'undefined' || typeof m === 'undefined') {
        setTimeout(arguments.callee, 100);
        return;
    }

    const photonicWeapons = [
        // 1. PRISM BLADE - Rainbow Slash Sword
        {
            name: "prism blade",
            descriptionFunction() {
                return `<b style="background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">PRISM BLADE</b><br>rainbow crystal sword that splits light<br>each slash releases 7 colored waves<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            slashCycle: 0,
            rainbowPhase: 0,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                if (m.cycle < this.slashCycle) return;
                this.slashCycle = m.cycle + 30;

                const colors = [
                    { name: 'red', hex: '#ff0000' },
                    { name: 'orange', hex: '#ff7f00' },
                    { name: 'yellow', hex: '#ffff00' },
                    { name: 'green', hex: '#00ff00' },
                    { name: 'blue', hex: '#0000ff' },
                    { name: 'indigo', hex: '#4b0082' },
                    { name: 'violet', hex: '#9400d3' }
                ];

                // Create 7 rainbow slashes
                for (let i = 0; i < 7; i++) {
                    const angle = m.angle + (i - 3) * 0.15;
                    const color = colors[i];

                    const path = [{
                        x: m.pos.x + 30 * Math.cos(angle),
                        y: m.pos.y + 30 * Math.sin(angle)
                    }, {
                        x: m.pos.x + 200 * Math.cos(angle),
                        y: m.pos.y + 200 * Math.sin(angle)
                    }];

                    // Draw slash trail
                    ctx.save();
                    ctx.strokeStyle = color.hex;
                    ctx.lineWidth = 8;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = color.hex;
                    ctx.beginPath();
                    ctx.moveTo(path[0].x, path[0].y);
                    ctx.lineTo(path[1].x, path[1].y);
                    ctx.stroke();
                    ctx.restore();

                    // Create light particles
                    for (let j = 0; j < 15; j++) {
                        const t = j / 15;
                        const px = path[0].x + (path[1].x - path[0].x) * t;
                        const py = path[0].y + (path[1].y - path[0].y) * t;

                        simulation.drawList.push({
                            x: px + (Math.random() - 0.5) * 20,
                            y: py + (Math.random() - 0.5) * 20,
                            radius: 2 + Math.random() * 4,
                            color: color.hex,
                            time: 15 + Math.floor(Math.random() * 10)
                        });
                    }

                    // Damage check
                    for (let k = 0; k < mob.length; k++) {
                        if (mob[k].alive) {
                            const dist = this.distToSegment(mob[k].position, path[0], path[1]);
                            if (dist < mob[k].radius + 40) {
                                mob[k].damage(0.5 * (m.damageDone || 1));

                                // Rainbow stun effect
                                if (typeof mobs.statusSlow === 'function') {
                                    mobs.statusSlow(mob[k], 30);
                                }
                            }
                        }
                    }
                }

                b.muzzleFlash(40);
            },
            distToSegment(p, a, b) {
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const len2 = dx * dx + dy * dy;
                let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
                t = Math.max(0, Math.min(1, t));
                const px = a.x + t * dx;
                const py = a.y + t * dy;
                return Math.sqrt((p.x - px) * (p.x - px) + (p.y - py) * (p.y - py));
            },
            do() {
                this.rainbowPhase += 0.05;

                // Draw weapon on player
                ctx.save();
                ctx.translate(m.pos.x, m.pos.y);
                ctx.rotate(m.angle);

                // Crystal blade with rainbow gradient
                const gradient = ctx.createLinearGradient(20, 0, 80, 0);
                const hue = (this.rainbowPhase * 100) % 360;
                gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
                gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 100%, 70%)`);
                gradient.addColorStop(1, `hsl(${(hue + 120) % 360}, 100%, 80%)`);

                ctx.fillStyle = gradient;
                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;

                // Blade shape
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(75, -8);
                ctx.lineTo(85, 0);
                ctx.lineTo(75, 8);
                ctx.closePath();
                ctx.fill();

                // Crystalline facets
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(20 + i * 12, -6);
                    ctx.lineTo(20 + i * 12, 6);
                    ctx.stroke();
                }

                ctx.restore();
            }
        },

        // 2. AURORA CANNON - Northern Lights Beam
        {
            name: "aurora cannon",
            descriptionFunction() {
                return `<b style="color: #00ffaa; text-shadow: 0 0 10px #00ffaa;">AURORA CANNON</b><br>fires undulating northern light beams<br>freezes and illuminates enemies<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            beamActive: false,
            beamDuration: 0,
            wavePhase: 0,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                this.beamActive = true;
                this.beamDuration = 45;
                m.fireCDcycle = m.cycle + 90;
            },
            do() {
                this.wavePhase += 0.1;

                if (this.beamActive && this.beamDuration > 0) {
                    this.beamDuration--;

                    const range = 600;
                    const width = 50;

                    // Create aurora wave effect
                    for (let layer = 0; layer < 3; layer++) {
                        ctx.save();
                        ctx.globalAlpha = 0.4 - layer * 0.1;

                        const gradient = ctx.createLinearGradient(
                            m.pos.x, m.pos.y,
                            m.pos.x + range * Math.cos(m.angle),
                            m.pos.y + range * Math.sin(m.angle)
                        );

                        gradient.addColorStop(0, '#00ffaa');
                        gradient.addColorStop(0.3, '#00aaff');
                        gradient.addColorStop(0.6, '#aa00ff');
                        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');

                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = width + layer * 20;
                        ctx.shadowBlur = 30;
                        ctx.shadowColor = '#00ffaa';

                        ctx.beginPath();
                        const points = 50;
                        for (let i = 0; i <= points; i++) {
                            const t = i / points;
                            const dist = range * t;
                            const wave = Math.sin(this.wavePhase + t * Math.PI * 4) * 20;

                            const perpAngle = m.angle + Math.PI / 2;
                            const x = m.pos.x + dist * Math.cos(m.angle) + wave * Math.cos(perpAngle);
                            const y = m.pos.y + dist * Math.sin(m.angle) + wave * Math.sin(perpAngle);

                            if (i === 0) ctx.moveTo(x, y);
                            else ctx.lineTo(x, y);
                        }
                        ctx.stroke();
                        ctx.restore();
                    }

                    // Aurora particles
                    for (let i = 0; i < 20; i++) {
                        const t = Math.random();
                        const dist = range * t;
                        const wave = Math.sin(this.wavePhase + t * Math.PI * 4) * 20;
                        const perpAngle = m.angle + Math.PI / 2;
                        const x = m.pos.x + dist * Math.cos(m.angle) + wave * Math.cos(perpAngle);
                        const y = m.pos.y + dist * Math.sin(m.angle) + wave * Math.sin(perpAngle);

                        const colors = ['#00ffaa', '#00aaff', '#aa00ff', '#ff00ff'];
                        simulation.drawList.push({
                            x: x + (Math.random() - 0.5) * width,
                            y: y + (Math.random() - 0.5) * width,
                            radius: 3 + Math.random() * 5,
                            color: colors[Math.floor(Math.random() * colors.length)],
                            time: 8
                        });
                    }

                    // Damage and freeze
                    for (let i = 0; i < mob.length; i++) {
                        if (mob[i].alive) {
                            const dx = mob[i].position.x - m.pos.x;
                            const dy = mob[i].position.y - m.pos.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < range) {
                                const angleToMob = Math.atan2(dy, dx);
                                const angleDiff = Math.abs(angleToMob - m.angle);

                                if (angleDiff < 0.3 || angleDiff > Math.PI * 2 - 0.3) {
                                    mob[i].damage(0.02 * (m.damageDone || 1));
                                    if (typeof mobs.statusSlow === 'function') {
                                        mobs.statusSlow(mob[i], 90);
                                    }
                                }
                            }
                        }
                    }

                    if (this.beamDuration <= 0) this.beamActive = false;
                }
            }
        },

        // 3. CRYSTAL STORM - Prismatic Shuriken Launcher
        {
            name: "crystal storm",
            descriptionFunction() {
                return `<b style="color: #ff69b4; text-shadow: 0 0 8px #ff69b4;">CRYSTAL STORM</b><br>rapid-fire crystalline shuriken<br>explodes into light shards on impact<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                const spread = 0.2;
                const count = 5;

                for (let i = 0; i < count; i++) {
                    const angle = m.angle + (Math.random() - 0.5) * spread;
                    const speed = 30 + Math.random() * 10;

                    const me = bullet.length;
                    const size = 8;
                    const vertices = [];
                    for (let j = 0; j < 6; j++) {
                        const a = (j / 6) * Math.PI * 2;
                        vertices.push({
                            x: m.pos.x + 30 * Math.cos(angle) + size * Math.cos(a),
                            y: m.pos.y + 30 * Math.sin(angle) + size * Math.sin(a)
                        });
                    }

                    bullet[me] = Bodies.fromVertices(
                        m.pos.x + 30 * Math.cos(angle),
                        m.pos.y + 30 * Math.sin(angle),
                        vertices,
                        {
                            density: 0.001,
                            frictionAir: 0.01,
                            angle: angle,
                            dmg: 0.4
                        }
                    );

                    bullet[me].classType = "bullet";
                    bullet[me].collisionFilter = {
                        category: cat.bullet,
                        mask: cat.map | cat.mob | cat.mobBullet
                    };

                    bullet[me].endCycle = m.cycle + 120;
                    bullet[me].crystalHue = Math.random() * 360;

                    bullet[me].do = function() {
                        this.torque += 0.001 * this.mass;

                        // Crystal glow trail
                        ctx.save();
                        ctx.globalAlpha = 0.6;
                        ctx.shadowBlur = 20;
                        ctx.shadowColor = `hsl(${this.crystalHue}, 100%, 60%)`;
                        ctx.fillStyle = `hsl(${this.crystalHue}, 100%, 70%)`;
                        ctx.beginPath();
                        const v = this.vertices;
                        ctx.moveTo(v[0].x, v[0].y);
                        for (let k = 1; k < v.length; k++) {
                            ctx.lineTo(v[k].x, v[k].y);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    };

                    bullet[me].onEnd = function() {
                        // Crystal explosion
                        for (let k = 0; k < 12; k++) {
                            const shardAngle = (k / 12) * Math.PI * 2;
                            simulation.drawList.push({
                                x: this.position.x + Math.cos(shardAngle) * (k * 3),
                                y: this.position.y + Math.sin(shardAngle) * (k * 3),
                                radius: 4 + Math.random() * 3,
                                color: `hsl(${this.crystalHue}, 100%, ${50 + Math.random() * 30}%)`,
                                time: 20
                            });
                        }
                    };

                    Matter.Body.setVelocity(bullet[me], {
                        x: player.velocity.x * 0.3 + speed * Math.cos(angle),
                        y: player.velocity.y * 0.3 + speed * Math.sin(angle)
                    });

                    Composite.add(engine.world, bullet[me]);
                }

                b.muzzleFlash(30);
                m.fireCDcycle = m.cycle + Math.floor(6 * b.fireCDscale);
            },
            do() {}
        },

        // 4. REFRACTION LANCE - Bending Light Spear
        {
            name: "refraction lance",
            descriptionFunction() {
                return `<b style="color: #ffdd00; text-shadow: 0 0 12px #ffdd00;">REFRACTION LANCE</b><br>light beam that bends around corners<br>pierces through multiple enemies<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                const startPos = { x: m.pos.x, y: m.pos.y };
                const segments = [];
                let currentAngle = m.angle;
                let currentPos = { x: startPos.x, y: startPos.y };

                // Create bending beam path
                for (let i = 0; i < 8; i++) {
                    const segmentLength = 100;
                    const endPos = {
                        x: currentPos.x + segmentLength * Math.cos(currentAngle),
                        y: currentPos.y + segmentLength * Math.sin(currentAngle)
                    };

                    segments.push({
                        start: { x: currentPos.x, y: currentPos.y },
                        end: { x: endPos.x, y: endPos.y },
                        angle: currentAngle
                    });

                    // Bend the beam
                    currentAngle += (Math.random() - 0.5) * 0.5;
                    currentPos = endPos;
                }

                // Draw the refracted beam
                ctx.save();
                for (let i = 0; i < segments.length; i++) {
                    const seg = segments[i];
                    const alpha = 1 - (i / segments.length) * 0.5;

                    const gradient = ctx.createLinearGradient(
                        seg.start.x, seg.start.y, seg.end.x, seg.end.y
                    );
                    gradient.addColorStop(0, `rgba(255, 221, 0, ${alpha})`);
                    gradient.addColorStop(0.5, `rgba(255, 170, 0, ${alpha * 0.8})`);
                    gradient.addColorStop(1, `rgba(255, 100, 0, ${alpha * 0.6})`);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 15 - i;
                    ctx.shadowBlur = 25;
                    ctx.shadowColor = '#ffdd00';
                    ctx.beginPath();
                    ctx.moveTo(seg.start.x, seg.start.y);
                    ctx.lineTo(seg.end.x, seg.end.y);
                    ctx.stroke();

                    // Light particles along beam
                    for (let j = 0; j < 8; j++) {
                        const t = j / 8;
                        simulation.drawList.push({
                            x: seg.start.x + (seg.end.x - seg.start.x) * t,
                            y: seg.start.y + (seg.end.y - seg.start.y) * t,
                            radius: 3 + Math.random() * 4,
                            color: '#ffdd00',
                            time: 12
                        });
                    }
                }
                ctx.restore();

                // Check damage along all segments
                for (let seg of segments) {
                    for (let k = 0; k < mob.length; k++) {
                        if (mob[k].alive) {
                            const dist = this.distToSegment(mob[k].position, seg.start, seg.end);
                            if (dist < mob[k].radius + 20) {
                                mob[k].damage(0.8 * (m.damageDone || 1));
                            }
                        }
                    }
                }

                b.muzzleFlash(35);
                m.fireCDcycle = m.cycle + Math.floor(40 * b.fireCDscale);
            },
            distToSegment(p, a, b) {
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const len2 = dx * dx + dy * dy;
                let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
                t = Math.max(0, Math.min(1, t));
                const px = a.x + t * dx;
                const py = a.y + t * dy;
                return Math.sqrt((p.x - px) * (p.x - px) + (p.y - py) * (p.y - py));
            },
            do() {}
        },

        // 5. PHOTON GATLING - Rapid Light Pulse Gun
        {
            name: "photon gatling",
            descriptionFunction() {
                return `<b style="color: #00ff00; text-shadow: 0 0 10px #00ff00;">PHOTON GATLING</b><br>extreme fire rate light pulses<br>each hit increases damage<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            spinPhase: 0,
            comboHits: 0,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                const angle = m.angle + (Math.random() - 0.5) * 0.1;
                const speed = 40;

                spawn.bullet(m.pos.x + 25 * Math.cos(angle), m.pos.y + 25 * Math.sin(angle), 6, 6);
                const me = bullet.length - 1;

                bullet[me].fill = `hsl(${120 + this.comboHits * 10}, 100%, 60%)`;
                bullet[me].stroke = 'rgba(0, 255, 0, 0)';
                bullet[me].endCycle = m.cycle + 60;
                bullet[me].dmg = 0.15 * (1 + this.comboHits * 0.05);
                bullet[me].comboRef = this;

                bullet[me].beforeDmg = function() {
                    this.comboRef.comboHits = Math.min(this.comboRef.comboHits + 1, 20);
                };

                bullet[me].do = function() {
                    // Glowing trail
                    ctx.save();
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = this.fill;
                    ctx.fillStyle = this.fill;
                    ctx.beginPath();
                    const v = this.vertices;
                    ctx.moveTo(v[0].x, v[0].y);
                    for (let i = 1; i < v.length; i++) {
                        ctx.lineTo(v[i].x, v[i].y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                };

                Matter.Body.setVelocity(bullet[me], {
                    x: player.velocity.x * 0.2 + speed * Math.cos(angle),
                    y: player.velocity.y * 0.2 + speed * Math.sin(angle)
                });

                Composite.add(engine.world, bullet[me]);

                b.muzzleFlash(15);
                m.fireCDcycle = m.cycle + Math.floor(3 * b.fireCDscale);
            },
            do() {
                this.spinPhase += 0.3;

                // Decay combo over time
                if (m.cycle % 30 === 0 && this.comboHits > 0) {
                    this.comboHits--;
                }

                // Draw spinning barrels
                ctx.save();
                ctx.translate(m.pos.x, m.pos.y);
                ctx.rotate(m.angle);

                for (let i = 0; i < 6; i++) {
                    const barrelAngle = (i / 6) * Math.PI * 2 + this.spinPhase;
                    const radius = 10;
                    const x = 35 + Math.cos(barrelAngle) * radius;
                    const y = Math.sin(barrelAngle) * radius;

                    ctx.fillStyle = `hsl(${120 + this.comboHits * 10}, 100%, ${40 + Math.sin(this.spinPhase + i) * 20}%)`;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = '#00ff00';
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();

                // Combo counter
                if (this.comboHits > 0) {
                    ctx.save();
                    ctx.fillStyle = `hsl(${120 + this.comboHits * 10}, 100%, 60%)`;
                    ctx.font = 'bold 16px Arial';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#00ff00';
                    ctx.fillText(`x${this.comboHits}`, m.pos.x + 20, m.pos.y - 40);
                    ctx.restore();
                }
            }
        },

        // 6. SPECTRUM WAVE - Rainbow Energy Wave
        {
            name: "spectrum wave",
            descriptionFunction() {
                return `<b style="background: linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">SPECTRUM WAVE</b><br>releases expanding rainbow shockwave<br>damages all enemies in range<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            charge: 0,
            maxCharge: 100,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                if (this.charge < this.maxCharge) {
                    b.refundAmmo();
                    return;
                }

                const maxRadius = 400;
                let radius = 50;
                const expansionRate = 15;

                const expandWave = () => {
                    if (radius < maxRadius && m.alive) {
                        requestAnimationFrame(expandWave);

                        if (!simulation.paused) {
                            // Draw rainbow rings
                            const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'];

                            for (let i = 0; i < colors.length; i++) {
                                ctx.save();
                                ctx.globalAlpha = 0.6 - (radius / maxRadius) * 0.4;
                                ctx.strokeStyle = colors[i];
                                ctx.lineWidth = 8;
                                ctx.shadowBlur = 20;
                                ctx.shadowColor = colors[i];
                                ctx.beginPath();
                                ctx.arc(m.pos.x, m.pos.y, radius - i * 8, 0, Math.PI * 2);
                                ctx.stroke();
                                ctx.restore();

                                // Particles
                                for (let j = 0; j < 3; j++) {
                                    const angle = Math.random() * Math.PI * 2;
                                    simulation.drawList.push({
                                        x: m.pos.x + Math.cos(angle) * radius,
                                        y: m.pos.y + Math.sin(angle) * radius,
                                        radius: 3 + Math.random() * 3,
                                        color: colors[i],
                                        time: 10
                                    });
                                }
                            }

                            // Damage mobs
                            for (let k = 0; k < mob.length; k++) {
                                if (mob[k].alive) {
                                    const dx = mob[k].position.x - m.pos.x;
                                    const dy = mob[k].position.y - m.pos.y;
                                    const dist = Math.sqrt(dx * dx + dy * dy);

                                    if (Math.abs(dist - radius) < 30) {
                                        mob[k].damage(0.3 * (m.damageDone || 1));
                                        const knockback = Vector.mult(Vector.normalise({ x: dx, y: dy }), 0.05 * mob[k].mass);
                                        mob[k].force.x += knockback.x;
                                        mob[k].force.y += knockback.y;
                                    }
                                }
                            }

                            radius += expansionRate;
                        }
                    }
                };

                requestAnimationFrame(expandWave);
                this.charge = 0;
                m.fireCDcycle = m.cycle + 120;
            },
            do() {
                if (input.fire && this.charge < this.maxCharge) {
                    this.charge = Math.min(this.maxCharge, this.charge + 2);
                }

                // Draw charge indicator
                if (this.charge > 0) {
                    const chargeRatio = this.charge / this.maxCharge;

                    ctx.save();
                    ctx.translate(m.pos.x, m.pos.y);

                    // Rainbow circle
                    for (let i = 0; i < 7; i++) {
                        const hue = (i / 7) * 360;
                        ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.arc(0, -35, 20, 
                            -Math.PI / 2 + (i / 7) * Math.PI * 2, 
                            -Math.PI / 2 + ((i + 1) / 7) * Math.PI * 2 * chargeRatio
                        );
                        ctx.stroke();
                    }

                    // Charge text
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = '#ffffff';
                    ctx.fillText(`${Math.floor(chargeRatio * 100)}%`, 0, -30);

                    ctx.restore();
                }
            }
        },

        // 7. PHOTONIC BEAM RIFLE - Focused Light Beam
        {
            name: "photonic beam rifle",
            descriptionFunction() {
                return `<b style="color: #ffff00; text-shadow: 0 0 10px #ffff00;">PHOTONIC BEAM RIFLE</b><br>fires a concentrated beam of light<br>pierces targets and deals sustained damage<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            beamActive: false,
            beamDuration: 0,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                this.beamActive = true;
                this.beamDuration = 60; // Longer duration
                m.fireCDcycle = m.cycle + 120; // Cooldown
            },
            do() {
                if (this.beamActive && this.beamDuration > 0) {
                    this.beamDuration--;

                    const range = 800;
                    const width = 20;
                    const damagePerTick = 0.08 * (m.damageDone || 1);

                    // Draw the focused beam
                    ctx.save();
                    ctx.globalAlpha = 0.7;
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = width;
                    ctx.shadowBlur = 25;
                    ctx.shadowColor = '#ffff00';

                    ctx.beginPath();
                    ctx.moveTo(m.pos.x, m.pos.y);
                    ctx.lineTo(
                        m.pos.x + range * Math.cos(m.angle),
                        m.pos.y + range * Math.sin(m.angle)
                    );
                    ctx.stroke();
                    ctx.restore();

                    // Particles along the beam
                    for (let i = 0; i < 10; i++) {
                        const t = Math.random();
                        const beamX = m.pos.x + (range * t * Math.cos(m.angle));
                        const beamY = m.pos.y + (range * t * Math.sin(m.angle));

                        simulation.drawList.push({
                            x: beamX + (Math.random() - 0.5) * width * 2,
                            y: beamY + (Math.random() - 0.5) * width * 2,
                            radius: 2 + Math.random() * 3,
                            color: '#ffff00',
                            time: 6
                        });
                    }

                    // Damage mobs hit by the beam
                    for (let i = 0; i < mob.length; i++) {
                        if (mob[i].alive) {
                            const dx = mob[i].position.x - m.pos.x;
                            const dy = mob[i].position.y - m.pos.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < range) {
                                const angleToMob = Math.atan2(dy, dx);
                                const angleDiff = Math.abs(angleToMob - m.angle);

                                if (angleDiff < (width / dist) || angleDiff > Math.PI * 2 - (width / dist)) {
                                    mob[i].damage(damagePerTick);
                                }
                            }
                        }
                    }

                    if (this.beamDuration <= 0) {
                        this.beamActive = false;
                    }
                }
            }
        },

        // 8. PHOTONIC SHARD LAUNCHER - Homing Crystal Projectiles
        {
            name: "photonic shard launcher",
            descriptionFunction() {
                return `<b style="color: #ffaa00; text-shadow: 0 0 10px #ffaa00;">PHOTONIC SHARD LAUNCHER</b><br>launches homing shards of light<br>they seek out and damage enemies<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            shardCount: 8,
            shardSpeed: 35,
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                for (let i = 0; i < this.shardCount; i++) {
                    const angle = m.angle + (Math.random() - 0.5) * 0.3;
                    const speed = this.shardSpeed + Math.random() * 5;

                    const me = bullet.length;
                    const size = 6;
                    const vertices = [];
                    for (let j = 0; j < 4; j++) { // Diamond shape
                        const a = (j / 4) * Math.PI * 2 + Math.PI / 4;
                        vertices.push({
                            x: m.pos.x + 15 * Math.cos(angle) + size * Math.cos(a),
                            y: m.pos.y + 15 * Math.sin(angle) + size * Math.sin(a)
                        });
                    }

                    bullet[me] = Bodies.fromVertices(
                        m.pos.x + 15 * Math.cos(angle),
                        m.pos.y + 15 * Math.sin(angle),
                        vertices,
                        {
                            density: 0.001,
                            frictionAir: 0.02,
                            angle: angle,
                            dmg: 0.35
                        }
                    );

                    bullet[me].classType = "bullet";
                    bullet[me].collisionFilter = {
                        category: cat.bullet,
                        mask: cat.map | cat.mob | cat.mobBullet
                    };

                    bullet[me].endCycle = m.cycle + 180;
                    bullet[me].shardHue = Math.random() * 60 + 30; // Yellow-orange hue
                    bullet[me].homingStrength = 0.05;
                    bullet[me].target = null;

                    bullet[me].do = function() {
                        // Find closest alive mob if no target
                        if (!this.target || !this.target.alive) {
                            let closestDist = Infinity;
                            let potentialTarget = null;
                            for (let k = 0; k < mob.length; k++) {
                                if (mob[k].alive) {
                                    const dx = mob[k].position.x - this.position.x;
                                    const dy = mob[k].position.y - this.position.y;
                                    const dist = Math.sqrt(dx * dx + dy * dy);
                                    if (dist < closestDist) {
                                        closestDist = dist;
                                        potentialTarget = mob[k];
                                    }
                                }
                            }
                            this.target = potentialTarget;
                        }

                        // Homing
                        if (this.target) {
                            const dx = this.target.position.x - this.position.x;
                            const dy = this.target.position.y - this.position.y;
                            const angleToTarget = Math.atan2(dy, dx);
                            const angleDiff = angleToTarget - this.angle;

                            this.torque += Matter.Common.normaliseAngle(angleDiff) * this.homingStrength * this.mass;
                        }

                        // Crystal glow trail
                        ctx.save();
                        ctx.globalAlpha = 0.7;
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = `hsl(${this.shardHue}, 100%, 70%)`;
                        ctx.fillStyle = `hsl(${this.shardHue}, 100%, 80%)`;
                        ctx.beginPath();
                        const v = this.vertices;
                        ctx.moveTo(v[0].x, v[0].y);
                        for (let k = 1; k < v.length; k++) {
                            ctx.lineTo(v[k].x, v[k].y);
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    };

                    bullet[me].onHit = function(body) {
                        if (body.classType === 'mob') {
                            body.damage(this.dmg * (m.damageDone || 1));
                        }
                        // Small particle burst on hit
                        for (let k = 0; k < 5; k++) {
                            simulation.drawList.push({
                                x: this.position.x,
                                y: this.position.y,
                                radius: 2 + Math.random() * 2,
                                color: `hsl(${this.shardHue}, 100%, ${50 + Math.random() * 30}%)`,
                                time: 8
                            });
                        }
                    };

                    Matter.Body.setVelocity(bullet[me], {
                        x: player.velocity.x * 0.2 + speed * Math.cos(angle),
                        y: player.velocity.y * 0.2 + speed * Math.sin(angle)
                    });

                    Composite.add(engine.world, bullet[me]);
                }

                b.muzzleFlash(25);
                m.fireCDcycle = m.cycle + Math.floor(10 * b.fireCDscale);
            },
            do() {}
        },

        // 9. PHOTONIC DETONATOR - Area Denial Explosive Light Orb
        {
            name: "photonic detonator",
            descriptionFunction() {
                return `<b style="color: #ff4500; text-shadow: 0 0 10px #ff4500;">PHOTONIC DETONATOR</b><br>throws an explosive light orb<br>detonates after a short fuse, dealing AOE damage<br><em>requires: photonic crystal</em>`;
            },
            ammo: Infinity,
            ammoPack: Infinity,
            defaultAmmoPack: Infinity,
            have: false,
            fuse: 120, // 2 seconds fuse
            allowed() {
                return tech.haveGunCheck("photonic crystal", false);
            },
            fire() {
                const angle = m.angle;
                const speed = 25;

                const me = bullet.length;
                const radius = 12;
                bullet[me] = Bodies.circle(
                    m.pos.x + 30 * Math.cos(angle),
                    m.pos.y + 30 * Math.sin(angle),
                    radius,
                    {
                        density: 0.001,
                        frictionAir: 0.05,
                        dmg: 0 // Damage dealt on impact, main damage is from explosion
                    }
                );

                bullet[me].classType = "bullet";
                bullet[me].collisionFilter = {
                    category: cat.bullet,
                    mask: cat.map | cat.mob | cat.mobBullet
                };

                bullet[me].endCycle = m.cycle + this.fuse;
                bullet[me].detonatorHue = Math.random() * 40 + 10; // Orange-red hue
                bullet[me].isDetonator = true;
                bullet[me].detonationRadius = 150;
                bullet[me].detonationDamage = 2.0 * (m.damageDone || 1);

                bullet[me].do = function() {
                    // Pulsating glow
                    const pulse = 0.5 + Math.sin(m.cycle * 0.1 + this.detonatorHue) * 0.3;
                    ctx.save();
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = `hsl(${this.detonatorHue}, 100%, 70%)`;
                    ctx.fillStyle = `hsl(${this.detonatorHue}, 100%, ${80 * pulse}%)`;
                    ctx.beginPath();
                    ctx.arc(this.position.x, this.position.y, this.circleRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();

                    // Fuse timer visualization
                    if (m.cycle < this.endCycle) {
                        const fuseProgress = (this.endCycle - m.cycle) / this.fuse;
                        ctx.save();
                        ctx.strokeStyle = `hsl(${this.detonatorHue}, 100%, 50%)`;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(this.position.x, this.position.y, this.circleRadius + 5, -Math.PI / 2, -Math.PI / 2 + fuseProgress * Math.PI * 2);
                        ctx.stroke();
                        ctx.restore();
                    }
                };

                bullet[me].onEnd = function() { // Detonation
                    const explosionRadius = this.detonationRadius;
                    const damage = this.detonationDamage;
                    const hue = this.detonatorHue;

                    // Explosion visual
                    for (let i = 0; i < 360; i += 10) {
                        const angle = i * Math.PI / 180;
                        const dist = Math.random() * explosionRadius;
                        simulation.drawList.push({
                            x: this.position.x + Math.cos(angle) * dist,
                            y: this.position.y + Math.sin(angle) * dist,
                            radius: 3 + Math.random() * 4,
                            color: `hsl(${hue}, 100%, ${50 + Math.random() * 30}%)`,
                            time: 15
                        });
                    }

                    // Damage mobs in radius
                    for (let k = 0; k < mob.length; k++) {
                        if (mob[k].alive) {
                            const dx = mob[k].position.x - this.position.x;
                            const dy = mob[k].position.y - this.position.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < explosionRadius) {
                                mob[k].damage(damage * (1 - dist / explosionRadius)); // Damage falls off with distance
                                const knockback = Vector.mult(Vector.normalise({ x: dx, y: dy }), 0.08 * mob[k].mass);
                                mob[k].force.x += knockback.x;
                                mob[k].force.y += knockback.y;
                            }
                        }
                    }
                };

                Matter.Body.setVelocity(bullet[me], {
                    x: player.velocity.x * 0.2 + speed * Math.cos(angle),
                    y: player.velocity.y * 0.2 + speed * Math.sin(angle)
                });

                b.muzzleFlash(20);
                m.fireCDcycle = m.cycle + Math.floor(20 * b.fireCDscale);
            },
            do() {}
        }
    ];

    // Add all photonic crystal weapons to the game
    photonicWeapons.forEach(weapon => {
        b.guns.push(weapon);
    });

    console.log('%c✅ 6 Photonic Crystal Weapons Loaded!', 'color: #ff69b4; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px #ff69b4;');

})();