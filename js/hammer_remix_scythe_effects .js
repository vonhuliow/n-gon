// BIG HAMMER remix of scythe.js
// NOW FULLY COMPATIBLE WITH SCYTHE TECH
// Scythe tech upgrades affect hammer damage, stun, durability, visuals

javascript:(function () {
  const e = {
    name: "hammer",
    descriptionFunction() {
      return `swing a <b>massive hammer</b><br>affected by <b>scythe tech upgrades</b>`;
    },
    ammo: Infinity,
    ammoPack: Infinity,
    defaultAmmoPack: Infinity,
    have: false,
    fire() {},
    cycle: 0,
    hammer: undefined,
    head: undefined,
    trails: [],
    angle: 0,
    durability: 200,
    maxDurability: 200,

    do() {
      this.durability = Math.max(0, Math.min(this.durability, this.maxDurability));

      if (b.activeGun !== null && input.fire && this.durability > 0) {
        if (!this.hammer && b.guns[b.activeGun].name === 'hammer') {
          this.angle = m.angle;
          ({ hammer: this.hammer, head: this.head } = this.createHammer(player.position));

          // scythe-style resource cost
          if (!tech.isAmmoScythe) {
            if (tech.isEnergyHealth) {
              m.energy -= 0.1;
              if (tech.isPhaseScythe) m.immuneCycle = m.cycle;
            } else {
              m.health -= 0.1;
              m.displayHealth();
            }
          }
        }
      }

      // despawn
      if (this.hammer && (!input.fire || m.cycle > this.cycle + 40)) {
        Composite.remove(engine.world, this.hammer);
        this.hammer.parts.forEach(p => {
          Composite.remove(engine.world, p);
          const i = bullet.indexOf(p);
          if (i !== -1) bullet.splice(i, 1);
        });
        this.hammer = undefined;
        this.trails = [];
        m.fireCDcycle = 0;
      }

      // motion (affected by scythe rotation tech)
      if (this.hammer) {
        const rot = 0.08 + (tech.scytheRad ? tech.scytheRad * 0.05 : 0);
        Matter.Body.setAngularVelocity(this.hammer, Math.PI * rot);
        Matter.Body.setVelocity(this.hammer, {
          x: Math.cos(this.angle) * (tech.isMeleeScythe ? 14 : 18),
          y: Math.sin(this.angle) * (tech.isMeleeScythe ? 14 : 18)
        });
      }

      // trail visuals (reuse scythe visuals)
      if (this.head) {
        const verts = this.head.vertices.map(v => ({ x: v.x, y: v.y }));
        this.trails.push(verts);
        if (this.trails.length > 8) this.trails.shift();

        for (let i = 0; i < this.trails.length; i++) {
          const t = this.trails[i];
          const a = (i + 1) / this.trails.length;
          ctx.beginPath();
          ctx.moveTo(t[0].x, t[0].y);
          for (let j = 1; j < t.length; j++) ctx.lineTo(t[j].x, t[j].y);
          ctx.closePath();

          if (tech.isEnergyHealth) ctx.fillStyle = `rgba(0,255,255,${a})`;
          else if (tech.isAmmoScythe) ctx.fillStyle = `rgba(192,192,192,${a})`;
          else if (tech.isStunScythe) ctx.fillStyle = `rgba(75,0,130,${a})`;
          else ctx.fillStyle = `rgba(220,20,60,${a})`;

          ctx.fill();
        }
      }

      // damage + scythe tech scaling
      if (this.hammer) {
        for (let i = 0; i < mob.length; i++) {
          if (Matter.Query.collides(this.hammer, [mob[i]]).length > 0) {
            if (tech.durabilityScythe) this.durability--;

            let dmg = (m.damageDone || m.dmgScale) * 0.18 * 3.2;
            if (tech.isLongBlade) dmg *= 1.3;
            if (tech.scytheRange) dmg *= 1 + tech.scytheRange * 0.15;
            if (tech.isDoubleScythe) dmg *= 0.9;
            if (tech.isMeleeScythe) dmg *= 1.25;

            mob[i].damage(dmg, true);

            if (tech.isStunScythe) mobs.statusStun(mob[i], 90);

            simulation.drawList.push({
              x: mob[i].position.x,
              y: mob[i].position.y,
              radius: Math.sqrt(dmg) * 60,
              color: simulation.mobDmgColor,
              time: simulation.drawTime
            });
            break;
          }
        }
      }
    },

    createHammer(position) {
      const x = position.x;
      const y = position.y;
      this.cycle = m.cycle + (tech.scytheRange ? tech.scytheRange * 5 : 0);
      m.fireCDcycle = Infinity;

      // handle length affected by melee scythe tech
      const handleLength = 260 + (tech.isMeleeScythe ? 80 : 0);
      const handle = Bodies.rectangle(x, y, 26, handleLength, spawn.propsIsNotHoldable);
      bullet.push(handle);

      // hammer head grows with long blade tech
      const headSize = 160 + (tech.isLongBlade ? 40 : 0);
      const head = Bodies.rectangle(x, y - handleLength / 2 - 30, headSize, 90, spawn.propsIsNotHoldable);
      bullet.push(head);

      const hammer = Body.create({ parts: [handle, head] });
      Composite.add(engine.world, hammer);
      Matter.Body.setPosition(hammer, { x, y });

      hammer.collisionFilter.category = cat.bullet;
      hammer.collisionFilter.mask = cat.mob | cat.mobBullet | cat.body;
      hammer.frictionAir -= 0.01;

      return { hammer, head };
    }
  };

  b.guns.push(e);
  b.guns = b.guns.filter((obj, i, self) => i === self.findIndex(o => o.name === obj.name));

  console.log('%chammer + scythe tech compatibility installed', 'color: orange');
})();
